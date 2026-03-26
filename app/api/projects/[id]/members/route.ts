import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import {
  authMiddleware,
  unauthorizedResponse,
  forbiddenResponse,
  badRequestResponse,
  successResponse,
  serverErrorResponse,
} from '@/lib/middleware';

interface MemberRow {
  UserID: number;
}

async function ensureProjectMembersTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS ProjectMembers (
      ProjectMemberID INT AUTO_INCREMENT PRIMARY KEY,
      ProjectID INT NOT NULL,
      UserID INT NOT NULL,
      AddedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_project_member (ProjectID, UserID),
      FOREIGN KEY (ProjectID) REFERENCES Projects(ProjectID) ON DELETE CASCADE,
      FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

async function isAdmin(userId: number): Promise<boolean> {
  const adminRole = await prisma.userRole.findFirst({
    where: {
      UserID: userId,
      role: { RoleName: 'Admin' },
    },
  });
  return !!adminRole;
}

async function canManageProject(projectId: number, userId: number): Promise<boolean> {
  const project = await prisma.project.findUnique({
    where: { ProjectID: projectId },
    select: { CreatedBy: true },
  });
  if (!project) return false;
  if (project.CreatedBy === userId) return true;
  return isAdmin(userId);
}

async function getProjectMembers(projectId: number) {
  const project = await prisma.project.findUnique({
    where: { ProjectID: projectId },
    include: { creator: { select: { UserID: true, UserName: true, Email: true } } },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  await ensureProjectMembersTable();

  const explicitMembers = await prisma.$queryRaw<MemberRow[]>`
    SELECT UserID FROM ProjectMembers WHERE ProjectID = ${projectId}
  `;

  const taskAssignees = await prisma.task.findMany({
    where: {
      taskList: { ProjectID: projectId },
      AssignedTo: { not: null },
    },
    select: { AssignedTo: true },
  });

  const memberIds = new Set<number>();
  memberIds.add(project.CreatedBy);

  for (const row of explicitMembers) {
    memberIds.add(row.UserID);
  }

  for (const task of taskAssignees) {
    if (typeof task.AssignedTo === 'number') {
      memberIds.add(task.AssignedTo);
    }
  }

  const memberIdList = Array.from(memberIds);
  const users = await prisma.user.findMany({
    where: { UserID: { in: memberIdList } },
    select: { UserID: true, UserName: true, Email: true },
  });

  const allUsers = await prisma.user.findMany({
    select: { UserID: true, UserName: true, Email: true },
    orderBy: { UserName: 'asc' },
  });

  const memberStats = new Map<number, { taskCount: number; completed: number }>();
  const memberTasks = await prisma.task.findMany({
    where: {
      taskList: { ProjectID: projectId },
      AssignedTo: { in: memberIdList },
    },
    select: { AssignedTo: true, Status: true },
  });

  for (const task of memberTasks) {
    if (typeof task.AssignedTo !== 'number') continue;
    const current = memberStats.get(task.AssignedTo) || { taskCount: 0, completed: 0 };
    current.taskCount += 1;
    if (task.Status === 'Completed') current.completed += 1;
    memberStats.set(task.AssignedTo, current);
  }

  const data = users.map((user) => {
    const stats = memberStats.get(user.UserID) || { taskCount: 0, completed: 0 };
    return {
      userId: user.UserID,
      username: user.UserName,
      email: user.Email,
      taskCount: stats.taskCount,
      completed: stats.completed,
      isCreator: user.UserID === project.CreatedBy,
    };
  });

  return {
    data,
    creatorId: project.CreatedBy,
    availableUsers: allUsers.map((u) => ({
      userId: u.UserID,
      username: u.UserName,
      email: u.Email,
    })),
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authMiddleware(request);
    if (!auth.authenticated || !auth.user) return unauthorizedResponse(auth.error);

    const { id } = await params;
    const projectId = parseInt(id, 10);
    if (isNaN(projectId)) return badRequestResponse('Invalid project ID');

    const result = await getProjectMembers(projectId);
    return successResponse({ success: true, ...result });
  } catch (error: any) {
    if (error.message === 'Project not found') {
      return badRequestResponse('Project not found');
    }
    console.error('Get project members error:', error);
    return serverErrorResponse(error.message || 'Failed to fetch project members');
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authMiddleware(request);
    if (!auth.authenticated || !auth.user) return unauthorizedResponse(auth.error);

    const { id } = await params;
    const projectId = parseInt(id, 10);
    if (isNaN(projectId)) return badRequestResponse('Invalid project ID');

    const body = await request.json();
    const userId = parseInt(String(body.userId), 10);

    if (isNaN(userId)) {
      return badRequestResponse('Valid userId is required');
    }

    const canManage = await canManageProject(projectId, auth.user.userId);
    if (!canManage) {
      return forbiddenResponse('Only project creator or admin can manage members');
    }

    const user = await prisma.user.findUnique({ where: { UserID: userId }, select: { UserID: true } });
    if (!user) {
      return badRequestResponse('User not found');
    }

    await ensureProjectMembersTable();

    await prisma.$executeRawUnsafe(
      'INSERT IGNORE INTO ProjectMembers (ProjectID, UserID) VALUES (?, ?)',
      projectId,
      userId
    );

    const result = await getProjectMembers(projectId);
    return successResponse({ success: true, message: 'Member added', ...result });
  } catch (error: any) {
    console.error('Add project member error:', error);
    return serverErrorResponse(error.message || 'Failed to add project member');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authMiddleware(request);
    if (!auth.authenticated || !auth.user) return unauthorizedResponse(auth.error);

    const { id } = await params;
    const projectId = parseInt(id, 10);
    if (isNaN(projectId)) return badRequestResponse('Invalid project ID');

    const userId = parseInt(new URL(request.url).searchParams.get('userId') || '', 10);
    if (isNaN(userId)) {
      return badRequestResponse('Valid userId is required');
    }

    const canManage = await canManageProject(projectId, auth.user.userId);
    if (!canManage) {
      return forbiddenResponse('Only project creator or admin can manage members');
    }

    const project = await prisma.project.findUnique({ where: { ProjectID: projectId }, select: { CreatedBy: true } });
    if (!project) {
      return badRequestResponse('Project not found');
    }

    if (project.CreatedBy === userId) {
      return badRequestResponse('Project creator cannot be removed');
    }

    await ensureProjectMembersTable();

    await prisma.$executeRawUnsafe(
      'DELETE FROM ProjectMembers WHERE ProjectID = ? AND UserID = ?',
      projectId,
      userId
    );

    const result = await getProjectMembers(projectId);
    return successResponse({ success: true, message: 'Member removed', ...result });
  } catch (error: any) {
    console.error('Remove project member error:', error);
    return serverErrorResponse(error.message || 'Failed to remove project member');
  }
}
