import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { authMiddleware, unauthorizedResponse, badRequestResponse, successResponse, serverErrorResponse } from '@/lib/middleware';

async function isAdmin(userId: number): Promise<boolean> {
  const adminRole = await prisma.userRole.findFirst({
    where: {
      UserID: userId,
      role: { RoleName: 'Admin' },
    },
  });
  return !!adminRole;
}

export async function GET(request: NextRequest) {
  try {
    const auth = await authMiddleware(request);
    if (!auth.authenticated || !auth.user) {
      return unauthorizedResponse(auth.error);
    }

    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    if (!start || !end) {
      return badRequestResponse('start and end query params are required');
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return badRequestResponse('Invalid date range');
    }

    const userIsAdmin = await isAdmin(auth.user.userId);

    const tasks = await prisma.task.findMany({
      where: {
        DueDate: {
          gte: startDate,
          lte: endDate,
        },
        ...(!userIsAdmin ? { AssignedTo: auth.user.userId } : {}),
      },
      include: {
        taskList: {
          include: {
            project: {
              select: {
                ProjectID: true,
                ProjectName: true,
              },
            },
          },
        },
        assignedUser: {
          select: {
            UserID: true,
            UserName: true,
          },
        },
      },
      orderBy: [
        { DueDate: 'asc' },
        { Priority: 'desc' },
      ],
      take: 500,
    });

    return successResponse({
      success: true,
      data: tasks.map((task) => ({
        taskId: task.TaskID,
        title: task.Title,
        status: task.Status,
        priority: task.Priority,
        dueDate: task.DueDate,
        project: {
          projectId: task.taskList.project.ProjectID,
          projectName: task.taskList.project.ProjectName,
        },
        list: {
          listId: task.taskList.ListID,
          listName: task.taskList.ListName,
        },
        assignedTo: task.assignedUser
          ? {
              userId: task.assignedUser.UserID,
              username: task.assignedUser.UserName,
            }
          : null,
      })),
    });
  } catch (error: any) {
    console.error('Get calendar tasks error:', error);
    return serverErrorResponse(error.message || 'Failed to fetch calendar tasks');
  }
}