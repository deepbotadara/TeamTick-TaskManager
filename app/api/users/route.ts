import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { authMiddleware, unauthorizedResponse, successResponse, serverErrorResponse } from '@/lib/middleware';

// GET /api/users - Get all users
export async function GET(request: NextRequest) {
    try {
        const auth = await authMiddleware(request);
        if (!auth.authenticated) {
            return unauthorizedResponse(auth.error);
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
            taskCount: user._count.assignedTasks
        }));

        return successResponse({
            success: true,
            data: formattedUsers
        });

    } catch (error: any) {
        console.error('Get users error:', error);
        return serverErrorResponse(error.message || 'Failed to fetch users');
    }
}
