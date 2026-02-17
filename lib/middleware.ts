import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractToken, JWTPayload } from './auth';

export interface AuthenticatedRequest extends NextRequest {
    user?: JWTPayload;
}

/**
 * Middleware to verify JWT token and attach user to request
 */
export async function authMiddleware(request: NextRequest): Promise<{
    authenticated: boolean;
    user?: JWTPayload;
    error?: string
}> {
    const authHeader = request.headers.get('authorization');
    const token = extractToken(authHeader);

    if (!token) {
        return {
            authenticated: false,
            error: 'No authentication token provided'
        };
    }

    const user = verifyToken(token);

    if (!user) {
        return {
            authenticated: false,
            error: 'Invalid or expired token'
        };
    }

    return {
        authenticated: true,
        user
    };
}

/**
 * Helper to create unauthorized response
 */
export function unauthorizedResponse(message: string = 'Unauthorized') {
    return NextResponse.json(
        { success: false, error: message },
        { status: 401 }
    );
}

/**
 * Helper to create forbidden response
 */
export function forbiddenResponse(message: string = 'Forbidden') {
    return NextResponse.json(
        { success: false, error: message },
        { status: 403 }
    );
}

/**
 * Helper to create bad request response
 */
export function badRequestResponse(message: string, details?: any) {
    return NextResponse.json(
        { success: false, error: message, details },
        { status: 400 }
    );
}

/**
 * Helper to create not found response
 */
export function notFoundResponse(message: string = 'Resource not found') {
    return NextResponse.json(
        { success: false, error: message },
        { status: 404 }
    );
}

/**
 * Helper to create internal server error response
 */
export function serverErrorResponse(message: string = 'Internal server error') {
    return NextResponse.json(
        { success: false, error: message },
        { status: 500 }
    );
}

/**
 * Helper to create success response
 */
export function successResponse(data: any, status: number = 200) {
    return NextResponse.json(data, { status });
}
