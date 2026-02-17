import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { authMiddleware, unauthorizedResponse, notFoundResponse, badRequestResponse, successResponse, serverErrorResponse } from '@/lib/middleware';

// GET /api/projects/[id] - Get project by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await authMiddleware(request);
        if (!auth.authenticated) {
            return unauthorizedResponse(auth.error);
        }

        const { id } = await params;
        const projectId = parseInt(id);

        if (isNaN(projectId)) {
            return badRequestResponse('Invalid project ID');
        }

        // Get project with Prisma including creator and task lists
        const project = await prisma.project.findUnique({
            where: { ProjectID: projectId },
            include: {
                creator: {
                    select: {
                        UserName: true
                    }
                },
                taskLists: {
                    include: {
                        _count: {
                            select: { tasks: true }
                        }
                    },
                    orderBy: {
                        ListID: 'asc'
                    }
                }
            }
        });

        if (!project) {
            return notFoundResponse('Project not found');
        }

        // Transform task lists format
        const taskLists = project.taskLists.map(list => ({
            ListID: list.ListID,
            ListName: list.ListName,
            TaskCount: list._count.tasks
        }));

        return successResponse({
            ProjectID: project.ProjectID,
            ProjectName: project.ProjectName,
            Description: project.Description,
            CreatedBy: project.CreatedBy,
            CreatedAt: project.CreatedAt,
            CreatorName: project.creator.UserName,
            taskLists
        });

    } catch (error: any) {
        console.error('Get project error:', error);
        return serverErrorResponse(error.message || 'Failed to fetch project');
    }
}

// PUT /api/projects/[id] - Update project
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await authMiddleware(request);
        if (!auth.authenticated || !auth.user) {
            return unauthorizedResponse(auth.error);
        }

        const { id } = await params;
        const projectId = parseInt(id);

        if (isNaN(projectId)) {
            return badRequestResponse('Invalid project ID');
        }

        const body = await request.json();
        const { projectName, description } = body;

        if (!projectName) {
            return badRequestResponse('Project name is required');
        }

        // Check if project exists
        const existingProject = await prisma.project.findUnique({
            where: { ProjectID: projectId }
        });

        if (!existingProject) {
            return notFoundResponse('Project not found');
        }

        // Update project with Prisma
        await prisma.project.update({
            where: { ProjectID: projectId },
            data: {
                ProjectName: projectName,
                Description: description || null
            }
        });

        return successResponse({
            success: true,
            message: 'Project updated successfully'
        });

    } catch (error: any) {
        console.error('Update project error:', error);
        return serverErrorResponse(error.message || 'Failed to update project');
    }
}

// DELETE /api/projects/[id] - Delete project  
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await authMiddleware(request);
        if (!auth.authenticated || !auth.user) {
            return unauthorizedResponse(auth.error);
        }

        const { id } = await params;
        const projectId = parseInt(id);

        if (isNaN(projectId)) {
            return badRequestResponse('Invalid project ID');
        }

        // Check if project exists
        const project = await prisma.project.findUnique({
            where: { ProjectID: projectId }
        });

        if (!project) {
            return notFoundResponse('Project not found');
        }

        // Delete project (CASCADE will delete related task lists and tasks)
        await prisma.project.delete({
            where: { ProjectID: projectId }
        });

        return successResponse({
            success: true,
            message: 'Project deleted successfully'
        });

    } catch (error: any) {
        console.error('Delete project error:', error);
        return serverErrorResponse(error.message || 'Failed to delete project');
    }
}
