import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { authMiddleware, unauthorizedResponse, notFoundResponse, badRequestResponse, successResponse, serverErrorResponse } from '@/lib/middleware';

// PUT /api/tasks/[id]/move - Move task to different list
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
        const task = await prisma.task.findUnique({
            where: { TaskID: taskId }
        });

        if (!task) {
            return notFoundResponse('Task not found');
        }

        const body = await request.json();
        const { listId } = body;

        if (!listId) {
            return badRequestResponse('List ID is required');
        }

        // Get the new list
        const newList = await prisma.taskList.findUnique({
            where: { ListID: listId }
        });

        if (!newList) {
            return notFoundResponse('Target list not found');
        }

        // Update status based on list name
        let newStatus = task.Status;
        if (newList.ListName === 'Pending') newStatus = 'Pending';
        else if (newList.ListName === 'In Progress') newStatus = 'In Progress';
        else if (newList.ListName === 'Completed') newStatus = 'Completed';

        // Update task and log history in transaction
        await prisma.$transaction(async (tx) => {
            await tx.task.update({
                where: { TaskID: taskId },
                data: {
                    ListID: listId,
                    Status: newStatus
                }
            });

            await tx.taskHistory.create({
                data: {
                    TaskID: taskId,
                    ChangedBy: auth.user!.userId,
                    ChangeType: `Moved to ${newList.ListName}`
                }
            });
        });

        return successResponse({
            success: true,
            message: 'Task moved successfully'
        });

    } catch (error: any) {
        console.error('Move task error:', error);
        return serverErrorResponse(error.message || 'Failed to move task');
    }
}
