import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { authMiddleware, unauthorizedResponse, badRequestResponse, successResponse, serverErrorResponse } from '@/lib/middleware';

// GET /api/projects/[id]/members - Get project members (users who have tasks in the project)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await authMiddleware(request);
        if (!auth.authenticated || !auth.user) return unauthorizedResponse(auth.error);

        const { id } = await params;
        const projectId = parseInt(id);
        if (isNaN(projectId)) return badRequestResponse('Invalid project ID');

        // Get all users assigned to tasks within this project
        const taskLists = await prisma.taskList.findMany({
            where: { ProjectID: projectId },
            include: {
                tasks: {
                    where: { AssignedTo: { not: null } },
                    select: {
                        TaskID: true,
                        Title: true,
                        Status: true,
                        assignedUser: {
                            select: { UserID: true, UserName: true, Email: true }
                        }
                    }
                }
            }
        });

        // Aggregate unique members
        const memberMap = new Map<number, { userId: number; username: string; email: string; taskCount: number; completed: number }>();
        for (const list of taskLists) {
            for (const task of list.tasks) {
                if (!task.assignedUser) continue;
                const uid = task.assignedUser.UserID;
                if (!memberMap.has(uid)) {
                    memberMap.set(uid, { userId: uid, username: task.assignedUser.UserName, email: task.assignedUser.Email, taskCount: 0, completed: 0 });
                }
                const m = memberMap.get(uid)!;
                m.taskCount++;
                if (task.Status === 'Completed') m.completed++;
            }
        }

        // Also include the project creator
        const project = await prisma.project.findUnique({
            where: { ProjectID: projectId },
            include: { creator: { select: { UserID: true, UserName: true, Email: true } } }
        });
        if (project && !memberMap.has(project.creator.UserID)) {
            memberMap.set(project.creator.UserID, {
                userId: project.creator.UserID,
                username: project.creator.UserName,
                email: project.creator.Email,
                taskCount: 0,
                completed: 0
            });
        }

        return successResponse({
            success: true,
            data: Array.from(memberMap.values()),
            creatorId: project?.CreatedBy
        });

    } catch (error: any) {
        console.error('Get project members error:', error);
        return serverErrorResponse(error.message || 'Failed to fetch project members');
    }
}
