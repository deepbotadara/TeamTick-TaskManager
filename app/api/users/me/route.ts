import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { authMiddleware, unauthorizedResponse, successResponse, serverErrorResponse } from '@/lib/middleware';

// GET /api/users/me - Get current user profile
export async function GET(request: NextRequest) {
    try {
        const auth = await authMiddleware(request);
        if (!auth.authenticated || !auth.user) {
            return unauthorizedResponse(auth.error);
        }

        // Get user with Prisma including roles
        const user = await prisma.user.findUnique({
            where: { UserID: auth.user.userId },
            include: {
                userRoles: {
                    include: {
                        role: true
                    }
                }
            }
        });

        if (!user) {
            return unauthorizedResponse('User not found');
        }

        return successResponse({
            userId: user.UserID,
            username: user.UserName,
            email: user.Email,
            createdAt: user.CreatedAt,
            roles: user.userRoles.map((ur) => ur.role.RoleName)
        });

    } catch (error: any) {
        console.error('Get user profile error:', error);
        return serverErrorResponse(error.message || 'Failed to fetch user profile');
    }
}

// PUT /api/users/me - Update current user profile
export async function PUT(request: NextRequest) {
    try {
        const auth = await authMiddleware(request);
        if (!auth.authenticated || !auth.user) {
            return unauthorizedResponse(auth.error);
        }

        const body = await request.json();
        const { username, email } = body;

        // Build update data
        const updateData: { UserName?: string; Email?: string } = {};
        if (username !== undefined) updateData.UserName = username;
        if (email !== undefined) updateData.Email = email;

        if (Object.keys(updateData).length === 0) {
            return successResponse({
                success: true,
                message: 'No fields to update'
            });
        }

        // Update user with Prisma
        await prisma.user.update({
            where: { UserID: auth.user.userId },
            data: updateData
        });

        return successResponse({
            success: true,
            message: 'Profile updated successfully'
        });

    } catch (error: any) {
        console.error('Update user profile error:', error);
        return serverErrorResponse(error.message || 'Failed to update profile');
    }
}
