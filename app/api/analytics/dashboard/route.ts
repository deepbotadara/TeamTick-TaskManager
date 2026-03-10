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

    const taskWhere = userIsAdmin ? {} : { AssignedTo: userId };
    const projectWhere = userIsAdmin ? {} : { CreatedBy: userId };

    const totalProjects = await prisma.project.count({ where: projectWhere });

    const [totalTasks, completedTasks, pendingTasks, inProgressTasks] = await Promise.all([
      prisma.task.count({ where: taskWhere }),
      prisma.task.count({ where: { ...taskWhere, Status: 'Completed' } }),
      prisma.task.count({ where: { ...taskWhere, Status: 'Pending' } }),
      prisma.task.count({ where: { ...taskWhere, Status: 'In Progress' } })
    ]);

    const [myTotal, myCompleted, myPending, myInProgress] = await Promise.all([
      prisma.task.count({ where: { AssignedTo: userId } }),
      prisma.task.count({ where: { AssignedTo: userId, Status: 'Completed' } }),
      prisma.task.count({ where: { AssignedTo: userId, Status: 'Pending' } }),
      prisma.task.count({ where: { AssignedTo: userId, Status: 'In Progress' } })
    ]);

    const upcomingDeadlines = await prisma.task.findMany({
      where: {
        ...taskWhere,
        DueDate: { gte: new Date() },
        Status: { not: 'Completed' }
      },
      select: { TaskID: true, Title: true, DueDate: true, Priority: true, Status: true },
      orderBy: { DueDate: 'asc' },
      take: 5
    });

    // Team Workload Distribution (admin only)
    let teamWorkload: { userId: number; username: string; total: number; completed: number; inProgress: number; pending: number }[] = [];
    if (userIsAdmin) {
      const users = await prisma.user.findMany({
        select: {
          UserID: true,
          UserName: true,
          assignedTasks: { select: { Status: true } }
        }
      });
      teamWorkload = users
        .filter(u => u.assignedTasks.length > 0)
        .map(u => ({
          userId: u.UserID,
          username: u.UserName,
          total: u.assignedTasks.length,
          completed: u.assignedTasks.filter(t => t.Status === 'Completed').length,
          inProgress: u.assignedTasks.filter(t => t.Status === 'In Progress').length,
          pending: u.assignedTasks.filter(t => t.Status === 'Pending').length,
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);
    }

    // Project Progress Tracking
    const projects = await prisma.project.findMany({
      where: projectWhere,
      select: {
        ProjectID: true,
        ProjectName: true,
        taskLists: {
          select: {
            tasks: { select: { Status: true } }
          }
        }
      },
      orderBy: { CreatedAt: 'desc' },
      take: 10
    });

    const projectProgress = projects.map(p => {
      const allTasks = p.taskLists.flatMap(l => l.tasks);
      const total = allTasks.length;
      const completed = allTasks.filter(t => t.Status === 'Completed').length;
      return {
        projectId: p.ProjectID,
        projectName: p.ProjectName,
        total,
        completed,
        inProgress: allTasks.filter(t => t.Status === 'In Progress').length,
        pending: allTasks.filter(t => t.Status === 'Pending').length,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
      };
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
        })),
        teamWorkload,
        projectProgress
      }
    });

  } catch (error: any) {
    console.error('Get dashboard analytics error:', error);
    return serverErrorResponse(error.message || 'Failed to fetch dashboard analytics');
  }
}
