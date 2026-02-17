import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { authMiddleware, unauthorizedResponse, notFoundResponse, badRequestResponse, successResponse, serverErrorResponse } from '@/lib/middleware';

// GET /api/tasks/[id] - Get task by ID with details
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

        // Get task with Prisma including related data
        const task = await prisma.task.findUnique({
            where: { TaskID: taskId },
            include: {
                assignedUser: {
                    select: {
                        UserID: true,
                        UserName: true,
                        Email: true
                    }
                },
                comments: {
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
                },
                history: {
                    include: {
                        changedByUser: {
                            select: {
                                UserID: true,
                                UserName: true
                            }
                        }
                    },
                    orderBy: {
                        ChangeTime: 'desc'
                    }
                }
            }
        });

        if (!task) {
            return notFoundResponse('Task not found');
        }

        return successResponse({
            taskId: task.TaskID,
            title: task.Title,
            description: task.Description,
            priority: task.Priority,
            status: task.Status,
            dueDate: task.DueDate,
            listId: task.ListID,
            createdAt: task.CreatedAt,
            assignedTo: task.assignedUser ? {
                userId: task.assignedUser.UserID,
                username: task.assignedUser.UserName,
                email: task.assignedUser.Email
            } : null,
            comments: task.comments.map((c) => ({
                commentId: c.CommentID,
                commentText: c.CommentText,
                createdAt: c.CreatedAt,
                user: {
                    userId: c.user.UserID,
                    username: c.user.UserName
                }
            })),
            history: task.history.map((h) => ({
                historyId: h.HistoryID,
                changeType: h.ChangeType,
                changeTime: h.ChangeTime,
                changedBy: {
                    userId: h.changedByUser.UserID,
                    username: h.changedByUser.UserName
                }
            }))
        });

    } catch (error: any) {
        console.error('Get task error:', error);
        return serverErrorResponse(error.message || 'Failed to fetch task');
    }
}

// PUT /api/tasks/[id] - Update task
export async function PUT(
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

        // Check if task exists
        const existingTask = await prisma.task.findUnique({
            where: { TaskID: taskId }
        });

        if (!existingTask) {
            return notFoundResponse('Task not found');
        }

        const body = await request.json();
        const { title, description, priority, status, dueDate, assignedTo } = body;

        // Validate fields
        if (priority !== undefined) {
            const validPriorities = ['Low', 'Medium', 'High'];
            if (!validPriorities.includes(priority)) {
                return badRequestResponse('Invalid priority');
            }
        }
        if (status !== undefined) {
            const validStatuses = ['Pending', 'In Progress', 'Completed'];
            if (!validStatuses.includes(status)) {
                return badRequestResponse('Invalid status');
            }
        }

        // Build update data
        const updateData: any = {};
        if (title !== undefined) updateData.Title = title;
        if (description !== undefined) updateData.Description = description;
        if (priority !== undefined) updateData.Priority = priority;
        if (status !== undefined) updateData.Status = status;
        if (dueDate !== undefined) updateData.DueDate = dueDate ? new Date(dueDate) : null;
        if (assignedTo !== undefined) updateData.AssignedTo = assignedTo;

        if (Object.keys(updateData).length === 0) {
            return badRequestResponse('No fields to update');
        }

        // Update task and log history in transaction
        await prisma.$transaction(async (tx) => {
            await tx.task.update({
                where: { TaskID: taskId },
                data: updateData
            });

            await tx.taskHistory.create({
                data: {
                    TaskID: taskId,
                    ChangedBy: auth.user!.userId,
                    ChangeType: 'Task Updated'
                }
            });
        });

        return successResponse({
            success: true,
            message: 'Task updated successfully'
        });

    } catch (error: any) {
        console.error('Update task error:', error);
        return serverErrorResponse(error.message || 'Failed to update task');
    }
}

// DELETE /api/tasks/[id] - Delete task
export async function DELETE(
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

        // Check if task exists
        const task = await prisma.task.findUnique({
            where: { TaskID: taskId }
        });

        if (!task) {
            return notFoundResponse('Task not found');
        }

        // Delete task (cascade will handle comments and history)
        await prisma.task.delete({
            where: { TaskID: taskId }
        });

        return successResponse({
            success: true,
            message: 'Task deleted successfully'
        });

    } catch (error: any) {
        console.error('Delete task error:', error);
        return serverErrorResponse(error.message || 'Failed to delete task');
    }
}
