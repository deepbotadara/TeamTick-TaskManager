import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { authMiddleware, unauthorizedResponse, forbiddenResponse, badRequestResponse, successResponse, serverErrorResponse } from '@/lib/middleware';

// Helper to check if user is admin
async function isAdmin(userId: number): Promise<boolean> {
  const adminRole = await prisma.userRole.findFirst({
    where: {
      UserID: userId,
      role: { RoleName: 'Admin' }
    }
  });
  return !!adminRole;
}

// GET /api/users - Get all users (admin only)
export async function GET(request: NextRequest) {
    try {
        const auth = await authMiddleware(request);
        if (!auth.authenticated || !auth.user) {
            return unauthorizedResponse(auth.error);
        }

        // Only admins can list all users
        const userIsAdmin = await isAdmin(auth.user.userId);
        if (!userIsAdmin) {
            return forbiddenResponse('Admin access required');
        }

        const users = await prisma.user.findMany({
            include: {
                userRoles: {
                    include: {
                        role: true
                    }
                },
                _count: {
                    select: {
                        assignedTasks: true
                    }
                }
            },
            orderBy: { CreatedAt: 'desc' }
        });

        const formattedUsers = users.map((user) => ({
            userId: user.UserID,
            username: user.UserName,
            email: user.Email,
            createdAt: user.CreatedAt,
            roles: user.userRoles.map((ur) => ur.role.RoleName),
            roleIds: user.userRoles.map((ur) => ur.RoleID),
            taskCount: user._count.assignedTasks
        }));

        // Also fetch all available roles
        const roles = await prisma.role.findMany({
            orderBy: { RoleID: 'asc' }
        });

        return successResponse({
            success: true,
            data: formattedUsers,
            roles: roles.map(r => ({ roleId: r.RoleID, roleName: r.RoleName }))
        });

    } catch (error: any) {
        console.error('Get users error:', error);
        return serverErrorResponse(error.message || 'Failed to fetch users');
    }
}

// POST /api/users - Create new user (admin only)
export async function POST(request: NextRequest) {
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
        const { username, email, password, roleIds } = body;

        if (!username || !email || !password) {
            return badRequestResponse('Username, email, and password are required');
        }

        // Check for duplicate email or username
        const existing = await prisma.user.findFirst({
            where: {
                OR: [
                    { Email: email },
                    { UserName: username }
                ]
            }
        });
        if (existing) {
            return badRequestResponse('User with this email or username already exists');
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                UserName: username,
                Email: email,
                PasswordHash: passwordHash,
                userRoles: {
                    create: (roleIds && roleIds.length > 0 ? roleIds : [3]).map((rid: number) => ({
                        RoleID: rid
                    }))
                }
            },
            include: {
                userRoles: { include: { role: true } }
            }
        });

        return successResponse({
            success: true,
            message: 'User created successfully',
            data: {
                userId: user.UserID,
                username: user.UserName,
                email: user.Email,
                roles: user.userRoles.map(ur => ur.role.RoleName)
            }
        }, 201);

    } catch (error: any) {
        console.error('Create user error:', error);
        return serverErrorResponse(error.message || 'Failed to create user');
    }
}

// PUT /api/users - Update user (admin only)
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
        const { userId, username, email, roleIds } = body;

        if (!userId) {
            return badRequestResponse('User ID is required');
        }

        const existingUser = await prisma.user.findUnique({
            where: { UserID: userId }
        });
        if (!existingUser) {
            return badRequestResponse('User not found');
        }

        // Update user fields
        const updateData: any = {};
        if (username) updateData.UserName = username;
        if (email) updateData.Email = email;

        await prisma.user.update({
            where: { UserID: userId },
            data: updateData
        });

        // Update roles if provided
        if (roleIds && Array.isArray(roleIds)) {
            // Remove existing roles
            await prisma.userRole.deleteMany({
                where: { UserID: userId }
            });
            // Add new roles
            if (roleIds.length > 0) {
                await prisma.userRole.createMany({
                    data: roleIds.map((rid: number) => ({
                        UserID: userId,
                        RoleID: rid
                    }))
                });
            }
        }

        return successResponse({
            success: true,
            message: 'User updated successfully'
        });

    } catch (error: any) {
        console.error('Update user error:', error);
        return serverErrorResponse(error.message || 'Failed to update user');
    }
}

// DELETE /api/users - Delete user (admin only)
export async function DELETE(request: NextRequest) {
    try {
        const auth = await authMiddleware(request);
        if (!auth.authenticated || !auth.user) {
            return unauthorizedResponse(auth.error);
        }

        const userIsAdmin = await isAdmin(auth.user.userId);
        if (!userIsAdmin) {
            return forbiddenResponse('Admin access required');
        }

        const { searchParams } = new URL(request.url);
        const userId = parseInt(searchParams.get('userId') || '');

        if (isNaN(userId)) {
            return badRequestResponse('Valid user ID is required');
        }

        // Prevent deleting yourself
        if (userId === auth.user.userId) {
            return badRequestResponse('You cannot delete your own account');
        }

        await prisma.user.delete({
            where: { UserID: userId }
        });

        return successResponse({
            success: true,
            message: 'User deleted successfully'
        });

    } catch (error: any) {
        console.error('Delete user error:', error);
        return serverErrorResponse(error.message || 'Failed to delete user');
    }
}
