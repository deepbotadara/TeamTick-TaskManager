import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { authMiddleware, unauthorizedResponse, successResponse, serverErrorResponse } from '@/lib/middleware';

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

// GET /api/tasks/search - Search tasks (scoped to user unless admin)
export async function GET(request: NextRequest) {
    try {
        const auth = await authMiddleware(request);
        if (!auth.authenticated || !auth.user) {
            return unauthorizedResponse(auth.error);
        }

        const { searchParams } = new URL(request.url);
        const query = searchParams.get('query') || '';
        const status = searchParams.get('status');
        const priority = searchParams.get('priority');
        const assigneeId = searchParams.get('assignee');
        const dueDateFrom = searchParams.get('dueDateFrom');
        const dueDateTo = searchParams.get('dueDateTo');

        const userIsAdmin = await isAdmin(auth.user.userId);

        const where: any = {
            AND: [
                // Non-admin users can only see their own tasks
                ...(!userIsAdmin ? [{ AssignedTo: auth.user.userId }] : []),
                ...(query ? [{
                    OR: [
                        { Title: { contains: query } },
                        { Description: { contains: query } }
                    ]
                }] : []),
                ...(status ? [{ Status: status }] : []),
                ...(priority ? [{ Priority: priority }] : []),
                ...(assigneeId ? [{ AssignedTo: parseInt(assigneeId) }] : []),
                ...(dueDateFrom || dueDateTo ? [{
                    DueDate: {
                        ...(dueDateFrom ? { gte: new Date(dueDateFrom) } : {}),
                        ...(dueDateTo ? { lte: new Date(dueDateTo) } : {})
                    }
                }] : [])
            ]
        };

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
                },
                assignedUser: {
                    select: {
                        UserID: true,
                        UserName: true,
                        Email: true
                    }
                }
            },
            orderBy: { CreatedAt: 'desc' },
            take: 50
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
        console.error('Search tasks error:', error);
        return serverErrorResponse(error.message || 'Failed to search tasks');
    }
}
