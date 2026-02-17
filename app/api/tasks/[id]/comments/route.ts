import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { authMiddleware, unauthorizedResponse, badRequestResponse, successResponse, serverErrorResponse } from '@/lib/middleware';

// GET /api/tasks/[id]/comments - Get comments for a task
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await authMiddleware(request);
        if (!auth.authenticated) {
            return unauthorizedResponse(auth.error);
        }

        const { id } = await params;
        const taskId = parseInt(id);

        if (isNaN(taskId)) {
            return badRequestResponse('Invalid task ID');
        }

        // Get comments with Prisma
        const comments = await prisma.taskComment.findMany({
            where: { TaskID: taskId },
            include: {
                user: {
                    select: {
                        UserID: true,
                        UserName: true
                    }
                }
            },
            orderBy: {
                CreatedAt: 'desc'
            }
        });

        return successResponse({
            success: true,
            data: comments.map((c) => ({
                commentId: c.CommentID,
                commentText: c.CommentText,
                createdAt: c.CreatedAt,
                user: {
                    userId: c.user.UserID,
                    username: c.user.UserName
                }
            }))
        });

    } catch (error: any) {
        console.error('Get comments error:', error);
        return serverErrorResponse(error.message || 'Failed to fetch comments');
    }
}

// POST /api/tasks/[id]/comments - Add comment to task
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await authMiddleware(request);
        if (!auth.authenticated || !auth.user) {
            return unauthorizedResponse(auth.error);
        }

        const { id } = await params;
        const taskId = parseInt(id);

        if (isNaN(taskId)) {
            return badRequestResponse('Invalid task ID');
        }

        const body = await request.json();
        const { commentText } = body;

        if (!commentText || commentText.trim() === '') {
            return badRequestResponse('Comment text is required');
        }

        // Create comment with Prisma
        const comment = await prisma.taskComment.create({
            data: {
                TaskID: taskId,
                UserID: auth.user.userId,
                CommentText: commentText
            }
        });

        return successResponse({
            success: true,
            message: 'Comment added successfully',
            commentId: comment.CommentID
        }, 201);

    } catch (error: any) {
        console.error('Add comment error:', error);
        return serverErrorResponse(error.message || 'Failed to add comment');
    }
}
