import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, generateToken } from '@/lib/auth';
import { badRequestResponse, successResponse, serverErrorResponse } from '@/lib/middleware';

interface RegisterRequest {
    username?: string;
    name?: string;
    email: string;
    password: string;
}

export async function POST(request: NextRequest) {
    try {
        const body: RegisterRequest = await request.json();
        const username = body.username || body.name;
        const { email, password } = body;

        // Validation
        if (!username || !email || !password) {
            return badRequestResponse('Username, email, and password are required');
        }

        if (password.length < 6) {
            return badRequestResponse('Password must be at least 6 characters long');
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return badRequestResponse('Invalid email format');
        }

        // Check if user already exists using Prisma
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { Email: email },
                    { UserName: username }
                ]
            }
        });

        if (existingUser) {
            return badRequestResponse('User with this email or username already exists');
        }

        // Hash password
        const passwordHash = await hashPassword(password);

        // Create user and assign default role using Prisma transaction
        const newUser = await prisma.$transaction(async (tx) => {
            // Create the user
            const user = await tx.user.create({
                data: {
                    UserName: username,
                    Email: email,
                    PasswordHash: passwordHash
                }
            });

            // Find or create default "User" role
            let userRole = await tx.role.findFirst({
                where: { RoleName: 'User' }
            });

            if (!userRole) {
                userRole = await tx.role.create({
                    data: { RoleName: 'User' }
                });
            }

            // Assign role to user
            await tx.userRole.create({
                data: {
                    UserID: user.UserID,
                    RoleID: userRole.RoleID
                }
            });

            return user;
        });        // Generate JWT token
        const token = generateToken({
            userId: newUser.UserID,
            email: newUser.Email,
            username: newUser.UserName
        });

        return successResponse({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                userId: newUser.UserID,
                username: newUser.UserName,
                email: newUser.Email,
                roles: ['User']
            }
        }, 201);

    } catch (error: any) {
        console.error('Registration error:', error);
        return serverErrorResponse(error.message || 'Failed to register user');
    }
}
