// Backend API Utilities for Analytics Operations
import { prisma } from '../prisma';

/**
 * Get dashboard analytics
 */
export async function getDashboardAnalytics(userId?: number) {
  // Get total tasks
  const totalTasks = await prisma.task.count({
    ...(userId && {
      where: {
        AssignedTo: userId
      }
    })
  });
  
  // Get tasks by status
  const tasksByStatus = await prisma.task.groupBy({
    by: ['Status'],
    _count: true,
    ...(userId && {
      where: {
        AssignedTo: userId
      }
    })
  });
  
  // Get tasks by priority
  const tasksByPriority = await prisma.task.groupBy({
    by: ['Priority'],
    _count: true,
    ...(userId && {
      where: {
        AssignedTo: userId
      }
    })
  });
  
  // Get total projects
  const totalProjects = await prisma.project.count({
    ...(userId && {
      where: {
        CreatedBy: userId
      }
    })
  });
  
  // Get recent activity
  const recentActivity = await prisma.taskHistory.findMany({
    take: 10,
    include: {
      task: {
        select: {
          TaskID: true,
          Title: true
        }
      },
      changedByUser: {
        select: {
          UserID: true,
          UserName: true
        }
      }
    },
    orderBy: {
      ChangeTime: 'desc'
    },
    ...(userId && {
      where: {
        ChangedBy: userId
      }
    })
  });
  
  // Get overdue tasks
  const overdueTasks = await prisma.task.count({
    where: {
      DueDate: {
        lt: new Date()
      },
      Status: {
        not: 'Completed'
      },
      ...(userId && {
        AssignedTo: userId
      })
    }
  });
  
  // Get tasks due this week
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  
  const tasksDueThisWeek = await prisma.task.count({
    where: {
      DueDate: {
        gte: today,
        lte: nextWeek
      },
      Status: {
        not: 'Completed'
      },
      ...(userId && {
        AssignedTo: userId
      })
    }
  });
  
  return {
    totalTasks,
    totalProjects,
    overdueTasks,
    tasksDueThisWeek,
    tasksByStatus: tasksByStatus.map(item => ({
      status: item.Status,
      count: item._count
    })),
    tasksByPriority: tasksByPriority.map(item => ({
      priority: item.Priority,
      count: item._count
    })),
    recentActivity: recentActivity.map(item => ({
      id: item.HistoryID,
      taskId: item.TaskID,
      taskTitle: item.task.Title,
      changeType: item.ChangeType,
      changedBy: item.changedByUser.UserName,
      changedAt: item.ChangeTime
    }))
  };
}

/**
 * Get user performance analytics
 */
export async function getUserPerformanceAnalytics(userId: number) {
  // Get all tasks assigned to user
  const allTasks = await prisma.task.findMany({
    where: {
      AssignedTo: userId
    },
    include: {
      taskList: {
        include: {
          project: true
        }
      }
    }
  });
  
  // Calculate completion rate
  const completedTasks = allTasks.filter(t => t.Status === 'Completed');
  const completionRate = allTasks.length > 0 ? (completedTasks.length / allTasks.length) * 100 : 0;
  
  // Calculate on-time completion rate
  const onTimeCompletions = completedTasks.filter(t => 
    t.DueDate && new Date(t.DueDate) >= new Date()
  );
  const onTimeRate = completedTasks.length > 0 ? (onTimeCompletions.length / completedTasks.length) * 100 : 0;
  
  // Group tasks by project
  const tasksByProject = allTasks.reduce((acc, task) => {
    const projectName = task.taskList.project.ProjectName;
    if (!acc[projectName]) {
      acc[projectName] = {
        total: 0,
        completed: 0,
        inProgress: 0,
        pending: 0
      };
    }
    acc[projectName].total++;
    if (task.Status === 'Completed') acc[projectName].completed++;
    if (task.Status === 'In Progress') acc[projectName].inProgress++;
    if (task.Status === 'Pending') acc[projectName].pending++;
    return acc;
  }, {} as Record<string, any>);
  
  return {
    userId,
    totalTasks: allTasks.length,
    completedTasks: completedTasks.length,
    inProgressTasks: allTasks.filter(t => t.Status === 'In Progress').length,
    pendingTasks: allTasks.filter(t => t.Status === 'Pending').length,
    completionRate: Math.round(completionRate * 10) / 10,
    onTimeRate: Math.round(onTimeRate * 10) / 10,
    tasksByProject
  };
}

/**
 * Get project analytics
 */
export async function getProjectAnalytics(projectId: number) {
  const project = await prisma.project.findUnique({
    where: { ProjectID: projectId },
    include: {
      taskLists: {
        include: {
          tasks: {
            include: {
              assignedUser: {
                select: {
                  UserID: true,
                  UserName: true
                }
              }
            }
          }
        }
      }
    }
  });
  
  if (!project) {
    throw new Error('Project not found');
  }
  
  const allTasks = project.taskLists.flatMap(list => list.tasks);
  
  // Calculate progress
  const completedTasks = allTasks.filter(t => t.Status === 'Completed').length;
  const progress = allTasks.length > 0 ? (completedTasks / allTasks.length) * 100 : 0;
  
  // Group tasks by assignee
  const tasksByAssignee = allTasks.reduce((acc, task) => {
    const assigneeName = task.assignedUser?.UserName || 'Unassigned';
    if (!acc[assigneeName]) {
      acc[assigneeName] = {
        total: 0,
        completed: 0,
        inProgress: 0,
        pending: 0
      };
    }
    acc[assigneeName].total++;
    if (task.Status === 'Completed') acc[assigneeName].completed++;
    if (task.Status === 'In Progress') acc[assigneeName].inProgress++;
    if (task.Status === 'Pending') acc[assigneeName].pending++;
    return acc;
  }, {} as Record<string, any>);
  
  // Get overdue tasks
  const overdueTasks = allTasks.filter(t => 
    t.DueDate && new Date(t.DueDate) < new Date() && t.Status !== 'Completed'
  );
  
  return {
    projectId: project.ProjectID,
    projectName: project.ProjectName,
    totalTasks: allTasks.length,
    completedTasks: completedTasks,
    inProgressTasks: allTasks.filter(t => t.Status === 'In Progress').length,
    pendingTasks: allTasks.filter(t => t.Status === 'Pending').length,
    overdueTasks: overdueTasks.length,
    progress: Math.round(progress * 10) / 10,
    tasksByAssignee,
    tasksByList: project.taskLists.map(list => ({
      listName: list.ListName,
      taskCount: list.tasks.length
    }))
  };
}

/**
 * Get team workload distribution
 */
export async function getTeamWorkloadDistribution() {
  const users = await prisma.user.findMany({
    include: {
      assignedTasks: {
        where: {
          Status: {
            not: 'Completed'
          }
        }
      }
    }
  });
  
  return users.map(user => ({
    userId: user.UserID,
    userName: user.UserName,
    email: user.Email,
    activeTasks: user.assignedTasks.length,
    highPriorityTasks: user.assignedTasks.filter(t => t.Priority === 'High').length,
    overdueTasks: user.assignedTasks.filter(t => 
      t.DueDate && new Date(t.DueDate) < new Date()
    ).length
  })).sort((a, b) => b.activeTasks - a.activeTasks);
}
