// Backend API Utilities for User Operations
import { prisma } from '../prisma';
import bcrypt from 'bcryptjs';
import { User, Role } from '@prisma/client';

export interface CreateUserData {
  userName: string;
  email: string;
  password: string;
  roleIds?: number[];
}

export interface UpdateUserData {
  userName?: string;
  email?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

/**
 * Get all users
 */
export async function getAllUsers() {
  return await prisma.user.findMany({
    include: {
      userRoles: {
        include: {
          role: true
        }
      }
    },
    orderBy: {
      CreatedAt: 'desc'
    }
  });
}

/**
 * Get user by ID
 */
export async function getUserById(userId: number) {
  return await prisma.user.findUnique({
    where: { UserID: userId },
    include: {
      userRoles: {
        include: {
          role: true
        }
      },
      projects: true,
      assignedTasks: {
        include: {
          taskList: {
            include: {
              project: true
            }
          }
        }
      }
    }
  });
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { Email: email },
    include: {
      userRoles: {
        include: {
          role: true
        }
      }
    }
  });
}

/**
 * Get user by username
 */
export async function getUserByUsername(username: string) {
  return await prisma.user.findUnique({
    where: { UserName: username },
    include: {
      userRoles: {
        include: {
          role: true
        }
      }
    }
  });
}

/**
 * Create new user
 */
export async function createUser(data: CreateUserData) {
  const { userName, email, password, roleIds = [3] } = data; // Default role: User (RoleID: 3)
  
  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);
  
  // Create user with roles
  const user = await prisma.user.create({
    data: {
      UserName: userName,
      Email: email,
      PasswordHash: passwordHash,
      userRoles: {
        create: roleIds.map(roleId => ({
          RoleID: roleId
        }))
      }
    },
    include: {
      userRoles: {
        include: {
          role: true
        }
      }
    }
  });
  
  return user;
}

/**
 * Update user
 */
export async function updateUser(userId: number, data: UpdateUserData) {
  return await prisma.user.update({
    where: { UserID: userId },
    data: {
      ...(data.userName && { UserName: data.userName }),
      ...(data.email && { Email: data.email })
    },
    include: {
      userRoles: {
        include: {
          role: true
        }
      }
    }
  });
}

/**
 * Change user password
 */
export async function changeUserPassword(userId: number, data: ChangePasswordData) {
  const user = await prisma.user.findUnique({
    where: { UserID: userId }
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Verify current password
  const isValid = await bcrypt.compare(data.currentPassword, user.PasswordHash);
  if (!isValid) {
    throw new Error('Current password is incorrect');
  }
  
  // Hash new password
  const newPasswordHash = await bcrypt.hash(data.newPassword, 10);
  
  // Update password
  return await prisma.user.update({
    where: { UserID: userId },
    data: {
      PasswordHash: newPasswordHash
    }
  });
}

/**
 * Delete user
 */
export async function deleteUser(userId: number) {
  return await prisma.user.delete({
    where: { UserID: userId }
  });
}

/**
 * Assign role to user
 */
export async function assignRoleToUser(userId: number, roleId: number) {
  return await prisma.userRole.create({
    data: {
      UserID: userId,
      RoleID: roleId
    }
  });
}

/**
 * Remove role from user
 */
export async function removeRoleFromUser(userId: number, roleId: number) {
  return await prisma.userRole.deleteMany({
    where: {
      UserID: userId,
      RoleID: roleId
    }
  });
}

/**
 * Verify user credentials
 */
export async function verifyUserCredentials(email: string, password: string) {
  const user = await getUserByEmail(email);
  
  if (!user) {
    return null;
  }
  
  const isValid = await bcrypt.compare(password, user.PasswordHash);
  
  if (!isValid) {
    return null;
  }
  
  return user;
}
