import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/middleware';

export async function POST(request: NextRequest) {
    // In a more complex implementation, you might invalidate the token
    // For JWT, logout is typically handled on the client side by removing the token

    return successResponse({
        success: true,
        message: 'Logged out successfully'
    });
}
