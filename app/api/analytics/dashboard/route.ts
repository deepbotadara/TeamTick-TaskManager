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

// GET /api/analytics/dashboard - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const auth = await authMiddleware(request);
    if (!auth.authenticated || !auth.user) {
      return unauthorizedResponse(auth.error);
    }

    const userId = auth.user.userId;
    const userIsAdmin = await isAdmin(userId);

    // For admin: global stats. For regular user: only their own data.
    const taskWhere = userIsAdmin ? {} : { AssignedTo: userId };
    const projectWhere = userIsAdmin ? {} : { CreatedBy: userId };

    // Get total project count
    const totalProjects = await prisma.project.count({ where: projectWhere });

    // Get task statistics
    const [totalTasks, completedTasks, pendingTasks, inProgressTasks] = await Promise.all([
      prisma.task.count({ where: taskWhere }),
      prisma.task.count({ where: { ...taskWhere, Status: 'Completed' } }),
      prisma.task.count({ where: { ...taskWhere, Status: 'Pending' } }),
      prisma.task.count({ where: { ...taskWhere, Status: 'In Progress' } })
    ]);

    // Get my tasks statistics (always user-scoped)
    const [myTotal, myCompleted, myPending, myInProgress] = await Promise.all([
      prisma.task.count({ where: { AssignedTo: userId } }),
      prisma.task.count({ where: { AssignedTo: userId, Status: 'Completed' } }),
      prisma.task.count({ where: { AssignedTo: userId, Status: 'Pending' } }),
      prisma.task.count({ where: { AssignedTo: userId, Status: 'In Progress' } })
    ]);

    // Get upcoming deadlines (scoped)
    const upcomingDeadlines = await prisma.task.findMany({
      where: {
        ...taskWhere,
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
