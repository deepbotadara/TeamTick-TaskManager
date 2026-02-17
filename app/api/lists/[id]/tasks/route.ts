import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { authMiddleware, unauthorizedResponse, badRequestResponse, successResponse, serverErrorResponse } from '@/lib/middleware';

// GET /api/lists/[id]/tasks - Get tasks in a list
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
        const listId = parseInt(id);

        if (isNaN(listId)) {
            return badRequestResponse('Invalid list ID');
        }

        // Get tasks with Prisma including assigned user
        const tasks = await prisma.task.findMany({
            where: { ListID: listId },
            include: {
                assignedUser: {
                    select: {
                        UserID: true,
                        UserName: true,
                        Email: true
                    }
                }
            },
            orderBy: {
                CreatedAt: 'desc'
            }
        });

        const formattedTasks = tasks.map((task) => ({
            taskId: task.TaskID,
            title: task.Title,
            description: task.Description,
            priority: task.Priority,
            status: task.Status,
            dueDate: task.DueDate,
            createdAt: task.CreatedAt,
            assignedTo: task.assignedUser ? {
                userId: task.assignedUser.UserID,
                username: task.assignedUser.UserName,
                email: task.assignedUser.Email
            } : null
        }));

        return successResponse({
            success: true,
            data: formattedTasks
        });

    } catch (error: any) {
        console.error('Get tasks error:', error);
        return serverErrorResponse(error.message || 'Failed to fetch tasks');
    }
}

// POST /api/lists/[id]/tasks - Create new task
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
        const listId = parseInt(id);

        if (isNaN(listId)) {
            return badRequestResponse('Invalid list ID');
        }

        const body = await request.json();
        const { title, description, priority, status, dueDate, assignedTo } = body;

        if (!title) {
            return badRequestResponse('Task title is required');
        }

        // Validate priority
        const validPriorities = ['Low', 'Medium', 'High'];
        if (priority && !validPriorities.includes(priority)) {
            return badRequestResponse('Invalid priority. Must be Low, Medium, or High');
        }

        // Validate status
        const validStatuses = ['Pending', 'In Progress', 'Completed'];
        if (status && !validStatuses.includes(status)) {
            return badRequestResponse('Invalid status');
        }

        // Create task and log history in transaction
        const task = await prisma.$transaction(async (tx) => {
            const newTask = await tx.task.create({
                data: {
                    ListID: listId,
                    Title: title,
                    Description: description || null,
                    Priority: priority || 'Medium',
                    Status: status || 'Pending',
                    DueDate: dueDate ? new Date(dueDate) : null,
                    AssignedTo: assignedTo || null
                }
            });

            await tx.taskHistory.create({
                data: {
                    TaskID: newTask.TaskID,
                    ChangedBy: auth.user!.userId,
                    ChangeType: 'Task Created'
                }
            });

            return newTask;
        });

        return successResponse({
            success: true,
            message: 'Task created successfully',
            taskId: task.TaskID
        }, 201);

    } catch (error: any) {
        console.error('Create task error:', error);
        return serverErrorResponse(error.message || 'Failed to create task');
    }
}
