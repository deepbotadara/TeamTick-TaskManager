import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { authMiddleware, unauthorizedResponse, badRequestResponse, successResponse, serverErrorResponse } from '@/lib/middleware';
import { comparePassword, hashPassword } from '@/lib/auth';

// PUT /api/users/me/password - Change password
export async function PUT(request: NextRequest) {
    try {
        const auth = await authMiddleware(request);
        if (!auth.authenticated || !auth.user) {
            return unauthorizedResponse(auth.error);
        }

        const body = await request.json();
        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword) {
            return badRequestResponse('Current password and new password are required');
        }

        if (newPassword.length < 6) {
            return badRequestResponse('New password must be at least 6 characters long');
        }

        // Get current user with Prisma
        const user = await prisma.user.findUnique({
            where: { UserID: auth.user.userId },
            select: { PasswordHash: true }
        });

        if (!user) {
            return unauthorizedResponse('User not found');
        }

        // Verify current password
        const isValidPassword = await comparePassword(currentPassword, user.PasswordHash);

        if (!isValidPassword) {
            return badRequestResponse('Current password is incorrect');
        }

        // Hash new password
        const newPasswordHash = await hashPassword(newPassword);

        // Update password with Prisma
        await prisma.user.update({
            where: { UserID: auth.user.userId },
            data: { PasswordHash: newPasswordHash }
        });

        return successResponse({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error: any) {
        console.error('Change password error:', error);
        return serverErrorResponse(error.message || 'Failed to change password');
    }
}
