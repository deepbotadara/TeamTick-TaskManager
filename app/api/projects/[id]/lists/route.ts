import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { authMiddleware, unauthorizedResponse, badRequestResponse, successResponse, serverErrorResponse } from '@/lib/middleware';

// GET /api/projects/[id]/lists - Get task lists for a project
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
        const projectId = parseInt(id);

        if (isNaN(projectId)) {
            return badRequestResponse('Invalid project ID');
        }

        // Get task lists with Prisma including task count
        const taskLists = await prisma.taskList.findMany({
            where: { ProjectID: projectId },
            include: {
                _count: {
                    select: { tasks: true }
                }
            },
            orderBy: {
                ListID: 'asc'
            }
        });

        const formattedLists = taskLists.map(list => ({
            ListID: list.ListID,
            ListName: list.ListName,
            ProjectID: list.ProjectID,
            TaskCount: list._count.tasks
        }));

        return successResponse({
            success: true,
            data: formattedLists
        });

    } catch (error: any) {
        console.error('Get task lists error:', error);
        return serverErrorResponse(error.message || 'Failed to fetch task lists');
    }
}

// POST /api/projects/[id]/lists - Create new task list
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await authMiddleware(request);
        if (!auth.authenticated) {
            return unauthorizedResponse(auth.error);
        }

        const { id } = await params;
        const projectId = parseInt(id);

        if (isNaN(projectId)) {
            return badRequestResponse('Invalid project ID');
        }

        const body = await request.json();
        const { listName } = body;

        if (!listName) {
            return badRequestResponse('List name is required');
        }

        // Create task list with Prisma
        const taskList = await prisma.taskList.create({
            data: {
                ProjectID: projectId,
                ListName: listName
            }
        });

        return successResponse({
            success: true,
            message: 'Task list created successfully',
            listId: taskList.ListID
        }, 201);

    } catch (error: any) {
        console.error('Create task list error:', error);
        return serverErrorResponse(error.message || 'Failed to create task list');
    }
}
