import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { authMiddleware, unauthorizedResponse, badRequestResponse, successResponse, serverErrorResponse } from '@/lib/middleware';

// GET /api/tasks/[id]/history - Get task change history
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

        // Get history with Prisma
        const history = await prisma.taskHistory.findMany({
            where: { TaskID: taskId },
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
        });

        return successResponse({
            success: true,
            data: history.map((h) => ({
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
        console.error('Get task history error:', error);
        return serverErrorResponse(error.message || 'Failed to fetch task history');
    }
}
