import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { authMiddleware, unauthorizedResponse, successResponse, serverErrorResponse } from '@/lib/middleware';

type NotificationType = 'assigned' | 'due-soon' | 'status-changed';

interface NotificationItem {
  id: string;
  type: NotificationType;
  taskId: number;
  taskTitle: string;
  message: string;
  createdAt: Date;
}

export async function GET(request: NextRequest) {
  try {
    const auth = await authMiddleware(request);
    if (!auth.authenticated || !auth.user) {
      return unauthorizedResponse(auth.error);
    }

    const userId = auth.user.userId;
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10) || 20, 50);

    const now = new Date();
    const inThreeDays = new Date(now);
    inThreeDays.setDate(inThreeDays.getDate() + 3);

    const dueSoonTasks = await prisma.task.findMany({
      where: {
        AssignedTo: userId,
        Status: { in: ['Pending', 'In Progress'] },
        DueDate: {
          gte: now,
          lte: inThreeDays,
        },
      },
      select: {
        TaskID: true,
        Title: true,
        DueDate: true,
      },
      orderBy: {
        DueDate: 'asc',
      },
      take: limit,
    });

    const assignedHistory = await prisma.taskHistory.findMany({
      where: {
        ChangedBy: { not: userId },
        ChangeType: { contains: 'Assign' },
        task: {
          AssignedTo: userId,
        },
      },
      include: {
        task: {
          select: { TaskID: true, Title: true },
        },
        changedByUser: {
          select: { UserName: true },
        },
      },
      orderBy: {
        ChangeTime: 'desc',
      },
      take: limit,
    });

    const createdAndAssigned = await prisma.taskHistory.findMany({
      where: {
        ChangedBy: { not: userId },
        ChangeType: 'Task Created',
        task: {
          AssignedTo: userId,
        },
      },
      include: {
        task: {
          select: { TaskID: true, Title: true },
        },
        changedByUser: {
          select: { UserName: true },
        },
      },
      orderBy: {
        ChangeTime: 'desc',
      },
      take: limit,
    });

    const statusHistory = await prisma.taskHistory.findMany({
      where: {
        ChangedBy: { not: userId },
        ChangeType: { contains: 'Status' },
        task: {
          AssignedTo: userId,
        },
      },
      include: {
        task: {
          select: { TaskID: true, Title: true },
        },
        changedByUser: {
          select: { UserName: true },
        },
      },
      orderBy: {
        ChangeTime: 'desc',
      },
      take: limit,
    });

    const notifications: NotificationItem[] = [];

    for (const row of dueSoonTasks) {
      if (!row.DueDate) continue;
      notifications.push({
        id: `due-${row.TaskID}-${row.DueDate.toISOString()}`,
        type: 'due-soon',
        taskId: row.TaskID,
        taskTitle: row.Title,
        message: `Due soon on ${row.DueDate.toLocaleDateString()}`,
        createdAt: row.DueDate,
      });
    }

    for (const row of assignedHistory) {
      notifications.push({
        id: `assigned-${row.HistoryID}`,
        type: 'assigned',
        taskId: row.task.TaskID,
        taskTitle: row.task.Title,
        message: `${row.changedByUser.UserName} assigned you this task`,
        createdAt: row.ChangeTime || now,
      });
    }

    for (const row of createdAndAssigned) {
      notifications.push({
        id: `created-${row.HistoryID}`,
        type: 'assigned',
        taskId: row.task.TaskID,
        taskTitle: row.task.Title,
        message: `${row.changedByUser.UserName} created and assigned this task`,
        createdAt: row.ChangeTime || now,
      });
    }

    for (const row of statusHistory) {
      notifications.push({
        id: `status-${row.HistoryID}`,
        type: 'status-changed',
        taskId: row.task.TaskID,
        taskTitle: row.task.Title,
        message: `${row.changedByUser.UserName} updated status (${row.ChangeType})`,
        createdAt: row.ChangeTime || now,
      });
    }

    const dedup = new Map<string, NotificationItem>();
    for (const item of notifications) {
      if (!dedup.has(item.id)) {
        dedup.set(item.id, item);
      }
    }

    const data = Array.from(dedup.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
      .map((n) => ({
        id: n.id,
        type: n.type,
        taskId: n.taskId,
        taskTitle: n.taskTitle,
        message: n.message,
        createdAt: n.createdAt,
      }));

    return successResponse({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('Get notifications error:', error);
    return serverErrorResponse(error.message || 'Failed to fetch notifications');
  }
}
