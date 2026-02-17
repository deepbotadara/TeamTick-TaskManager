import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { authMiddleware, unauthorizedResponse, successResponse, serverErrorResponse } from '@/lib/middleware';

// GET /api/analytics/dashboard - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const auth = await authMiddleware(request);
    if (!auth.authenticated || !auth.user) {
      return unauthorizedResponse(auth.error);
    }

    // Get total project count
    const totalProjects = await prisma.project.count();

    // Get task statistics
    const [totalTasks, completedTasks, pendingTasks, inProgressTasks] = await Promise.all([
      prisma.task.count(),
      prisma.task.count({ where: { Status: 'Completed' } }),
      prisma.task.count({ where: { Status: 'Pending' } }),
      prisma.task.count({ where: { Status: 'In Progress' } })
    ]);

    // Get my tasks statistics
    const [myTotal, myCompleted, myPending, myInProgress] = await Promise.all([
      prisma.task.count({ where: { AssignedTo: auth.user.userId } }),
      prisma.task.count({ where: { AssignedTo: auth.user.userId, Status: 'Completed' } }),
      prisma.task.count({ where: { AssignedTo: auth.user.userId, Status: 'Pending' } }),
      prisma.task.count({ where: { AssignedTo: auth.user.userId, Status: 'In Progress' } })
    ]);

    // Get upcoming deadlines
    const upcomingDeadlines = await prisma.task.findMany({
      where: {
        DueDate: {
          gte: new Date()
        },
        Status: {
          not: 'Completed'
        }
      },
      select: {
        TaskID: true,
        Title: true,
        DueDate: true,
        Priority: true,
        Status: true
      },
      orderBy: {
        DueDate: 'asc'
      },
      take: 5
    });

    return successResponse({
      success: true,
      data: {
        totalProjects,
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        myTasks: {
          total: myTotal,
          completed: myCompleted,
          pending: myPending,
          inProgress: myInProgress
        },
        upcomingDeadlines: upcomingDeadlines.map((task) => ({
          taskId: task.TaskID,
          title: task.Title,
          dueDate: task.DueDate,
          priority: task.Priority,
          status: task.Status
        }))
      }
    });

  } catch (error: any) {
    console.error('Get dashboard analytics error:', error);
    return serverErrorResponse(error.message || 'Failed to fetch dashboard analytics');
  }
}
