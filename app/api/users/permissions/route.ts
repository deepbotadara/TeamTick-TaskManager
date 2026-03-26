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

type PermissionDefinition = {
  key: string;
  label: string;
  description: string;
};

type PermissionRow = {
  RoleID: number;
  PermissionKey: string;
  IsAllowed: number;
};

const PERMISSIONS: PermissionDefinition[] = [
  { key: 'view_projects', label: 'View All Projects', description: 'Can view all projects and project details' },
  { key: 'create_project', label: 'Create Project', description: 'Can create new projects' },
  { key: 'edit_project', label: 'Edit/Delete Project', description: 'Can edit or delete any project' },
  { key: 'view_assigned_tasks', label: 'View Assigned Tasks', description: 'Can view tasks assigned to self' },
  { key: 'create_task', label: 'Create Task', description: 'Can create tasks in project lists' },
  { key: 'edit_any_task', label: 'Edit/Delete Any Task', description: 'Can edit or delete any task' },
  { key: 'add_comments', label: 'Add Comments', description: 'Can comment on tasks' },
  { key: 'manage_users', label: 'Manage Users', description: 'Can create, edit, and delete users' },
  { key: 'assign_roles', label: 'Assign Roles', description: 'Can change user role assignment' },
  { key: 'view_analytics', label: 'View Analytics', description: 'Can access analytics dashboard' },
  { key: 'search_all_tasks', label: 'Search All Tasks', description: 'Can search tasks across all projects' },
];

function getDefaultPermission(roleName: string, key: string): boolean {
  const normalized = roleName.trim().toLowerCase();

  if (normalized === 'admin') {
    return true;
  }

  const managerRole = normalized === 'manager' || normalized === 'project manager';
  if (managerRole) {
    const managerAllowed = new Set([
      'view_projects',
      'create_project',
      'view_assigned_tasks',
      'create_task',
      'add_comments',
      'search_all_tasks',
      'view_analytics',
    ]);
    return managerAllowed.has(key);
  }

  const userAllowed = new Set(['view_assigned_tasks', 'add_comments']);
  return userAllowed.has(key);
}

async function ensureRolePermissionsTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS RolePermissions (
      RoleID INT NOT NULL,
      PermissionKey VARCHAR(100) NOT NULL,
      IsAllowed TINYINT(1) NOT NULL DEFAULT 0,
      UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (RoleID, PermissionKey),
      FOREIGN KEY (RoleID) REFERENCES Roles(RoleID) ON DELETE CASCADE
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

// GET /api/users/permissions
export async function GET(request: NextRequest) {
  try {
    const auth = await authMiddleware(request);
    if (!auth.authenticated || !auth.user) {
      return unauthorizedResponse(auth.error);
    }

    const userIsAdmin = await isAdmin(auth.user.userId);
    if (!userIsAdmin) {
      return forbiddenResponse('Admin access required');
    }

    await ensureRolePermissionsTable();

    const roles = await prisma.role.findMany({
      orderBy: { RoleID: 'asc' },
      select: { RoleID: true, RoleName: true },
    });

    const saved = await prisma.$queryRaw<PermissionRow[]>`
      SELECT RoleID, PermissionKey, IsAllowed FROM RolePermissions
    `;

    const savedMap = new Map<string, boolean>();
    for (const row of saved) {
      savedMap.set(`${row.RoleID}:${row.PermissionKey}`, row.IsAllowed === 1);
    }

    const matrix = PERMISSIONS.map((permission) => {
      const values: Record<number, boolean> = {};
      for (const role of roles) {
        const key = `${role.RoleID}:${permission.key}`;
        const savedValue = savedMap.get(key);
        values[role.RoleID] = savedValue ?? getDefaultPermission(role.RoleName, permission.key);
      }
      return {
        key: permission.key,
        label: permission.label,
        description: permission.description,
        values,
      };
    });

    return successResponse({
      success: true,
      permissions: matrix,
      roles: roles.map((r) => ({ roleId: r.RoleID, roleName: r.RoleName })),
    });
  } catch (error: any) {
    console.error('Get permissions error:', error);
    return serverErrorResponse(error.message || 'Failed to fetch permissions');
  }
}

// PUT /api/users/permissions
export async function PUT(request: NextRequest) {
  try {
    const auth = await authMiddleware(request);
    if (!auth.authenticated || !auth.user) {
      return unauthorizedResponse(auth.error);
    }

    const userIsAdmin = await isAdmin(auth.user.userId);
    if (!userIsAdmin) {
      return forbiddenResponse('Admin access required');
    }

    const body = await request.json();
    const updates = body?.updates as Array<{ roleId: number; permissionKey: string; allowed: boolean }>;

    if (!Array.isArray(updates) || updates.length === 0) {
      return badRequestResponse('updates array is required');
    }

    const validKeys = new Set(PERMISSIONS.map((p) => p.key));

    await ensureRolePermissionsTable();

    for (const update of updates) {
      if (
        typeof update?.roleId !== 'number' ||
        !validKeys.has(update?.permissionKey) ||
        typeof update?.allowed !== 'boolean'
      ) {
        return badRequestResponse('Invalid permission update payload');
      }

      await prisma.$executeRawUnsafe(
        `
          INSERT INTO RolePermissions (RoleID, PermissionKey, IsAllowed)
          VALUES (?, ?, ?)
          ON DUPLICATE KEY UPDATE IsAllowed = VALUES(IsAllowed)
        `,
        update.roleId,
        update.permissionKey,
        update.allowed ? 1 : 0
      );
    }

    return successResponse({ success: true, message: 'Permissions saved successfully' });
  } catch (error: any) {
    console.error('Save permissions error:', error);
    return serverErrorResponse(error.message || 'Failed to save permissions');
  }
}
