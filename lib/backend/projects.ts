// Backend API Utilities for Project Operations
import { prisma } from '../prisma';

export interface CreateProjectData {
  projectName: string;
  description?: string;
  createdBy: number;
}

export interface UpdateProjectData {
  projectName?: string;
  description?: string;
}

/**
 * Get all projects
 */
export async function getAllProjects() {
  return await prisma.project.findMany({
    include: {
      creator: {
        select: {
          UserID: true,
          UserName: true,
          Email: true
        }
      },
      taskLists: {
        include: {
          tasks: true
        }
      }
    },
    orderBy: {
      CreatedAt: 'desc'
    }
  });
}

/**
 * Get project by ID
 */
export async function getProjectById(projectId: number) {
  return await prisma.project.findUnique({
    where: { ProjectID: projectId },
    include: {
      creator: {
        select: {
          UserID: true,
          UserName: true,
          Email: true
        }
      },
      taskLists: {
        include: {
          tasks: {
            include: {
              assignedUser: {
                select: {
                  UserID: true,
                  UserName: true,
                  Email: true
                }
              }
            }
          }
        }
      }
    }
  });
}

/**
 * Get projects by creator
 */
export async function getProjectsByCreator(userId: number) {
  return await prisma.project.findMany({
    where: { CreatedBy: userId },
    include: {
      taskLists: {
        include: {
          tasks: true
        }
      }
    },
    orderBy: {
      CreatedAt: 'desc'
    }
  });
}

/**
 * Create new project
 */
export async function createProject(data: CreateProjectData) {
  const { projectName, description, createdBy } = data;
  
  // Create project with default task lists
  const project = await prisma.project.create({
    data: {
      ProjectName: projectName,
      Description: description,
      CreatedBy: createdBy,
      taskLists: {
        create: [
          { ListName: 'Pending' },
          { ListName: 'In Progress' },
          { ListName: 'Completed' }
        ]
      }
    },
    include: {
      creator: {
        select: {
          UserID: true,
          UserName: true,
          Email: true
        }
      },
      taskLists: true
    }
  });
  
  return project;
}

/**
 * Update project
 */
export async function updateProject(projectId: number, data: UpdateProjectData) {
  return await prisma.project.update({
    where: { ProjectID: projectId },
    data: {
      ...(data.projectName && { ProjectName: data.projectName }),
      ...(data.description !== undefined && { Description: data.description })
    },
    include: {
      creator: {
        select: {
          UserID: true,
          UserName: true,
          Email: true
        }
      },
      taskLists: {
        include: {
          tasks: true
        }
      }
    }
  });
}

/**
 * Delete project
 */
export async function deleteProject(projectId: number) {
  return await prisma.project.delete({
    where: { ProjectID: projectId }
  });
}

/**
 * Get project statistics
 */
export async function getProjectStatistics(projectId: number) {
  const project = await prisma.project.findUnique({
    where: { ProjectID: projectId },
    include: {
      taskLists: {
        include: {
          tasks: true
        }
      }
    }
  });
  
  if (!project) {
    throw new Error('Project not found');
  }
  
  const allTasks = project.taskLists.flatMap(list => list.tasks);
  
  const stats = {
    totalTasks: allTasks.length,
    pendingTasks: allTasks.filter(t => t.Status === 'Pending').length,
    inProgressTasks: allTasks.filter(t => t.Status === 'In Progress').length,
    completedTasks: allTasks.filter(t => t.Status === 'Completed').length,
    highPriorityTasks: allTasks.filter(t => t.Priority === 'High').length,
    overdueTasks: allTasks.filter(t => t.DueDate && new Date(t.DueDate) < new Date() && t.Status !== 'Completed').length
  };
  
  return {
    ...project,
    statistics: stats
  };
}
