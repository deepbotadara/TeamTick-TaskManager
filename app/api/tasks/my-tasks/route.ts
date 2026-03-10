import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { authMiddleware, unauthorizedResponse, successResponse, serverErrorResponse } from '@/lib/middleware';

// GET /api/tasks/my-tasks - Get current user's assigned tasks
export async function GET(request: NextRequest) {
    try {
        const auth = await authMiddleware(request);
        if (!auth.authenticated || !auth.user) {
            return unauthorizedResponse(auth.error);
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const priority = searchParams.get('priority');
        const dueDateFrom = searchParams.get('dueDateFrom');
        const dueDateTo = searchParams.get('dueDateTo');

        // Build where clause
        const where: any = {
            AssignedTo: auth.user.userId
        };

        if (status) {
            where.Status = status;
        }

        if (priority) {
            where.Priority = priority;
        }

        if (dueDateFrom || dueDateTo) {
            where.DueDate = {};
            if (dueDateFrom) where.DueDate.gte = new Date(dueDateFrom);
            if (dueDateTo) where.DueDate.lte = new Date(dueDateTo);
        }

        // Get tasks with Prisma
        const tasks = await prisma.task.findMany({
            where,
            include: {
                taskList: {
                    include: {
                        project: {
                            select: {
                                ProjectID: true,
                                ProjectName: true
                            }
                        }
                    }
                }
            },
            orderBy: [
                { DueDate: 'asc' },
                { Priority: 'desc' }
            ]
        });

        const formattedTasks = tasks.map((task) => ({
            taskId: task.TaskID,
            title: task.Title,
            description: task.Description,
            priority: task.Priority,
            status: task.Status,
            dueDate: task.DueDate,
            createdAt: task.CreatedAt,
            project: {
                projectId: task.taskList.project.ProjectID,
                projectName: task.taskList.project.ProjectName
            },
            list: {
                listId: task.taskList.ListID,
                listName: task.taskList.ListName
            }
        }));

        return successResponse({
            success: true,
            data: formattedTasks
        });

    } catch (error: any) {
        console.error('Get my tasks error:', error);
        return serverErrorResponse(error.message || 'Failed to fetch tasks');
    }
}
