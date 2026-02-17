// Backend API Utilities for Task Operations
import { prisma } from '../prisma';

export interface CreateTaskData {
  listId: number;
  title: string;
  description?: string;
  assignedTo?: number;
  priority?: 'Low' | 'Medium' | 'High';
  status?: 'Pending' | 'In Progress' | 'Completed';
  dueDate?: Date;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  assignedTo?: number;
  priority?: 'Low' | 'Medium' | 'High';
  status?: 'Pending' | 'In Progress' | 'Completed';
  dueDate?: Date;
  listId?: number;
}

/**
 * Get all tasks
 */
export async function getAllTasks() {
  return await prisma.task.findMany({
    include: {
      taskList: {
        include: {
          project: true
        }
      },
      assignedUser: {
        select: {
          UserID: true,
          UserName: true,
          Email: true
        }
      },
      comments: {
        include: {
          user: {
            select: {
              UserID: true,
              UserName: true,
              Email: true
            }
          }
        },
        orderBy: {
          CreatedAt: 'desc'
        }
      },
      history: {
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
      }
    },
    orderBy: {
      CreatedAt: 'desc'
    }
  });
}

/**
 * Get task by ID
 */
export async function getTaskById(taskId: number) {
  return await prisma.task.findUnique({
    where: { TaskID: taskId },
    include: {
      taskList: {
        include: {
          project: {
            include: {
              creator: {
                select: {
                  UserID: true,
                  UserName: true,
                  Email: true
                }
              }
            }
          }
        }
      },
      assignedUser: {
        select: {
          UserID: true,
          UserName: true,
          Email: true
        }
      },
      comments: {
        include: {
          user: {
            select: {
              UserID: true,
              UserName: true,
              Email: true
            }
          }
        },
        orderBy: {
          CreatedAt: 'desc'
        }
      },
      history: {
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
      }
    }
  });
}

/**
 * Get tasks by list ID
 */
export async function getTasksByListId(listId: number) {
  return await prisma.task.findMany({
    where: { ListID: listId },
    include: {
      assignedUser: {
        select: {
          UserID: true,
          UserName: true,
          Email: true
        }
      }
    },
    orderBy: {
      CreatedAt: 'desc'
    }
  });
}

/**
 * Get tasks assigned to user
 */
export async function getTasksByAssignedUser(userId: number) {
  return await prisma.task.findMany({
    where: { AssignedTo: userId },
    include: {
      taskList: {
        include: {
          project: true
        }
      }
    },
    orderBy: {
      DueDate: 'asc'
    }
  });
}

/**
 * Create new task
 */
export async function createTask(data: CreateTaskData, createdBy: number) {
  const task = await prisma.task.create({
    data: {
      ListID: data.listId,
      Title: data.title,
      Description: data.description,
      AssignedTo: data.assignedTo,
      Priority: data.priority || 'Medium',
      Status: data.status || 'Pending',
      DueDate: data.dueDate,
      history: {
        create: {
          ChangedBy: createdBy,
          ChangeType: 'Task Created'
        }
      }
    },
    include: {
      taskList: {
        include: {
          project: true
        }
      },
      assignedUser: {
        select: {
          UserID: true,
          UserName: true,
          Email: true
        }
      }
    }
  });
  
  return task;
}

/**
 * Update task
 */
export async function updateTask(taskId: number, data: UpdateTaskData, changedBy: number) {
  // Get current task to compare changes
  const currentTask = await prisma.task.findUnique({
    where: { TaskID: taskId }
  });
  
  if (!currentTask) {
    throw new Error('Task not found');
  }
  
  // Track changes for history
  const changes: string[] = [];
  
  if (data.status && data.status !== currentTask.Status) {
    changes.push(`Status Changed to ${data.status}`);
  }
  if (data.priority && data.priority !== currentTask.Priority) {
    changes.push(`Priority Set to ${data.priority}`);
  }
  if (data.assignedTo && data.assignedTo !== currentTask.AssignedTo) {
    changes.push('Task Assigned to User');
  }
  if (data.listId && data.listId !== currentTask.ListID) {
    changes.push('Task Moved to Different List');
  }
  
  // Update task
  const task = await prisma.task.update({
    where: { TaskID: taskId },
    data: {
      ...(data.title && { Title: data.title }),
      ...(data.description !== undefined && { Description: data.description }),
      ...(data.assignedTo !== undefined && { AssignedTo: data.assignedTo }),
      ...(data.priority && { Priority: data.priority }),
      ...(data.status && { Status: data.status }),
      ...(data.dueDate !== undefined && { DueDate: data.dueDate }),
      ...(data.listId && { ListID: data.listId }),
      history: {
        create: changes.map(change => ({
          ChangedBy: changedBy,
          ChangeType: change
        }))
      }
    },
    include: {
      taskList: {
        include: {
          project: true
        }
      },
      assignedUser: {
        select: {
          UserID: true,
          UserName: true,
          Email: true
        }
      }
    }
  });
  
  return task;
}

/**
 * Delete task
 */
export async function deleteTask(taskId: number) {
  return await prisma.task.delete({
    where: { TaskID: taskId }
  });
}

/**
 * Move task to different list
 */
export async function moveTaskToList(taskId: number, newListId: number, changedBy: number) {
  return await updateTask(taskId, { listId: newListId }, changedBy);
}

/**
 * Search tasks
 */
export async function searchTasks(query: string, filters?: {
  status?: string;
  priority?: string;
  assignedTo?: number;
  projectId?: number;
}) {
  return await prisma.task.findMany({
    where: {
      AND: [
        {
          OR: [
            { Title: { contains: query } },
            { Description: { contains: query } }
          ]
        },
        ...(filters?.status ? [{ Status: filters.status }] : []),
        ...(filters?.priority ? [{ Priority: filters.priority }] : []),
        ...(filters?.assignedTo ? [{ AssignedTo: filters.assignedTo }] : []),
        ...(filters?.projectId ? [{
          taskList: {
            ProjectID: filters.projectId
          }
        }] : [])
      ]
    },
    include: {
      taskList: {
        include: {
          project: true
        }
      },
      assignedUser: {
        select: {
          UserID: true,
          UserName: true,
          Email: true
        }
      }
    },
    orderBy: {
      CreatedAt: 'desc'
    }
  });
}

/**
 * Add comment to task
 */
export async function addTaskComment(taskId: number, userId: number, commentText: string) {
  return await prisma.taskComment.create({
    data: {
      TaskID: taskId,
      UserID: userId,
      CommentText: commentText
    },
    include: {
      user: {
        select: {
          UserID: true,
          UserName: true,
          Email: true
        }
      }
    }
  });
}

/**
 * Get task comments
 */
export async function getTaskComments(taskId: number) {
  return await prisma.taskComment.findMany({
    where: { TaskID: taskId },
    include: {
      user: {
        select: {
          UserID: true,
          UserName: true,
          Email: true
        }
      }
    },
    orderBy: {
      CreatedAt: 'desc'
    }
  });
}

/**
 * Get task history
 */
export async function getTaskHistory(taskId: number) {
  return await prisma.taskHistory.findMany({
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
}
