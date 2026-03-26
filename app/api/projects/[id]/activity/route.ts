import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import {
  authMiddleware,
  unauthorizedResponse,
  badRequestResponse,
  forbiddenResponse,
  successResponse,
  serverErrorResponse,
} from '@/lib/middleware';

async function isAdmin(userId: number): Promise<boolean> {
  const adminRole = await prisma.userRole.findFirst({
    where: {
      UserID: userId,
      role: { RoleName: 'Admin' },
    },
  });

  return !!adminRole;
}

async function hasProjectMembership(projectId: number, userId: number): Promise<boolean> {
  try {
    const rows = await prisma.$queryRaw<Array<{ UserID: number }>>`
      SELECT UserID
      FROM ProjectMembers
      WHERE ProjectID = ${projectId} AND UserID = ${userId}
      LIMIT 1
    `;
    return rows.length > 0;
  } catch {
    return false;
  }
}

async function canViewProject(projectId: number, userId: number): Promise<boolean> {
  const project = await prisma.project.findUnique({
    where: { ProjectID: projectId },
    select: { CreatedBy: true },
  });

  if (!project) return false;
  if (project.CreatedBy === userId) return true;
  if (await isAdmin(userId)) return true;
  return hasProjectMembership(projectId, userId);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authMiddleware(request);
    if (!auth.authenticated || !auth.user) {
      return unauthorizedResponse(auth.error);
    }

    const { id } = await params;
    const projectId = parseInt(id, 10);

    if (isNaN(projectId)) {
      return badRequestResponse('Invalid project ID');
    }

    const hasAccess = await canViewProject(projectId, auth.user.userId);
    if (!hasAccess) {
      return forbiddenResponse('You do not have access to this project activity');
    }

    const history = await prisma.taskHistory.findMany({
      where: {
        task: {
          taskList: {
            ProjectID: projectId,
          },
        },
      },
      include: {
        changedByUser: {
          select: {
            UserID: true,
            UserName: true,
          },
        },
        task: {
          select: {
            TaskID: true,
            Title: true,
            taskList: {
              select: {
                ListName: true,
              },
            },
          },
        },
      },
      orderBy: {
        ChangeTime: 'desc',
      },
      take: 80,
    });

    return successResponse({
      success: true,
      data: history.map((entry) => ({
        historyId: entry.HistoryID,
        changeType: entry.ChangeType,
        changeTime: entry.ChangeTime,
        task: {
          taskId: entry.task.TaskID,
          title: entry.task.Title,
          listName: entry.task.taskList.ListName,
        },
        changedBy: {
          userId: entry.changedByUser.UserID,
          username: entry.changedByUser.UserName,
        },
      })),
    });
  } catch (error: any) {
    console.error('Get project activity error:', error);
    return serverErrorResponse(error.message || 'Failed to fetch project activity');
  }
}