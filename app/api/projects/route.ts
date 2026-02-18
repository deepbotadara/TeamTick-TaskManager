import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { authMiddleware, unauthorizedResponse, badRequestResponse, successResponse, serverErrorResponse } from '@/lib/middleware';

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

// GET /api/projects - Get all projects (admin sees all, user sees own)
export async function GET(request: NextRequest) {
    try {
        const auth = await authMiddleware(request);
        if (!auth.authenticated || !auth.user) {
            return unauthorizedResponse(auth.error);
        }

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        const userIsAdmin = await isAdmin(auth.user.userId);

        // Build where clause: admin sees all, regular user sees only their own projects
        let where: any = {};
        if (userId) {
            where = { CreatedBy: parseInt(userId) };
        } else if (!userIsAdmin) {
            where = { CreatedBy: auth.user.userId };
        }

        // Get projects with Prisma
        const projects = await prisma.project.findMany({
            where,
            include: {
                creator: {
                    select: {
                        UserName: true
                    }
                },
                taskLists: {
                    include: {
                        tasks: {
                            select: {
                                TaskID: true,
                                Status: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                CreatedAt: 'desc'
            },
            skip,
            take: limit
        });

        // Get total count
        const total = await prisma.project.count({ where });

        // Transform the data
        const projectsData = projects.map(project => {
            const allTasks = project.taskLists.flatMap(list => list.tasks);
            const completedTasks = allTasks.filter(task => task.Status === 'Completed').length;

            return {
                ProjectID: project.ProjectID,
                ProjectName: project.ProjectName,
                Description: project.Description,
                CreatedBy: project.CreatedBy,
                CreatedAt: project.CreatedAt,
                CreatorName: project.creator.UserName,
                ListCount: project.taskLists.length,
                TaskCount: allTasks.length,
                CompletedTasks: completedTasks
            };
        });

        return successResponse({
            success: true,
            data: projectsData,
            pagination: {
                page,
                limit,
                total
            }
        });

    } catch (error: any) {
        console.error('Get projects error:', error);
        return serverErrorResponse(error.message || 'Failed to fetch projects');
    }
}

// POST /api/projects - Create new project
export async function POST(request: NextRequest) {
    try {
        const auth = await authMiddleware(request);
        if (!auth.authenticated || !auth.user) {
            return unauthorizedResponse(auth.error);
        }

        const body = await request.json();
        const { projectName, description } = body;

        if (!projectName) {
            return badRequestResponse('Project name is required');
        }

        // Create project with default task lists using Prisma transaction
        const project = await prisma.$transaction(async (tx) => {
            // Create the project
            const newProject = await tx.project.create({
                data: {
                    ProjectName: projectName,
                    Description: description || null,
                    CreatedBy: auth.user!.userId
                }
            });

            // Create default task lists
            const defaultLists = ['Pending', 'In Progress', 'Completed'];
            for (const listName of defaultLists) {
                await tx.taskList.create({
                    data: {
                        ProjectID: newProject.ProjectID,
                        ListName: listName
                    }
                });
            }

            return newProject;
        });

        return successResponse({
            success: true,
            message: 'Project created successfully',
            projectId: project.ProjectID
        }, 201);

    } catch (error: any) {
        console.error('Create project error:', error);
        return serverErrorResponse(error.message || 'Failed to create project');
    }
}
