import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { comparePassword, generateToken } from '@/lib/auth';
import { badRequestResponse, successResponse, serverErrorResponse, unauthorizedResponse } from '@/lib/middleware';

interface LoginRequest {
    email: string;
    password: string;
}

export async function POST(request: NextRequest) {
    try {
        const body: LoginRequest = await request.json();
        const { email, password } = body;

        // Validation
        if (!email || !password) {
            return badRequestResponse('Email and password are required');
        }

        // Find user by email with Prisma
        const user = await prisma.user.findUnique({
            where: { Email: email },
            include: {
                userRoles: {
                    include: {
                        role: true
                    }
                }
            }
        });

        if (!user) {
            return unauthorizedResponse('Invalid email or password');
        }

        // Verify password
        const isValidPassword = await comparePassword(password, user.PasswordHash);

        if (!isValidPassword) {
            return unauthorizedResponse('Invalid email or password');
        }

        // Extract role names
        const roleNames = user.userRoles.map((ur) => ur.role.RoleName);

        // Generate JWT token
        const token = generateToken({
            userId: user.UserID,
            email: user.Email,
            username: user.UserName
        });

        return successResponse({
            success: true,
            token,
            user: {
                userId: user.UserID,
                username: user.UserName,
                email: user.Email,
                roles: roleNames
            }
        });

    } catch (error: any) {
        console.error('Login error:', error);
        return serverErrorResponse(error.message || 'Failed to login');
    }
}
