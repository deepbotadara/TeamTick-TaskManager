# API Endpoint Design & Documentation

## Overview

This document outlines the comprehensive RESTful API design for the To-Do List application built with Next.js. All endpoints follow REST conventions and support full CRUD operations where applicable.

---

## Base URL

```
http://localhost:3000/api
```

---

## Table of Contents

1. [Authentication APIs](#authentication-apis)
2. [User Management APIs](#user-management-apis)
3. [Project APIs](#project-apis)
4. [Task List APIs](#task-list-apis)
5. [Task APIs](#task-apis)
6. [Comment APIs](#comment-apis)
7. [Task History APIs](#task-history-apis)
8. [Role Management APIs](#role-management-apis)
9. [Search & Filter APIs](#search--filter-apis)
10. [Analytics APIs](#analytics-apis)

---

## Authentication APIs

### Register New User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "userId": 1
}
```

---

### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "userId": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "roles": ["User"]
  }
}
```

---

### Logout
```http
POST /api/auth/logout
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## User Management APIs

### Get Current User Profile
```http
GET /api/users/me
```

**Response (200):**
```json
{
  "userId": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "roles": ["User"],
  "createdAt": "2025-01-01T10:00:00Z"
}
```

---

### Update User Profile
```http
PUT /api/users/me
```

**Request Body:**
```json
{
  "username": "john_updated",
  "email": "john_new@example.com"
}
```

---

### Change Password
```http
PUT /api/users/me/password
```

**Request Body:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!"
}
```

---

### Get All Users (Admin Only)
```http
GET /api/users
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

---

### Assign Role to User (Admin Only)
```http
POST /api/users/:userId/roles
```

**Request Body:**
```json
{
  "roleId": 2
}
```

---

## Project APIs

### Get All Projects
```http
GET /api/projects
```

**Query Parameters:**
- `userId` (optional): Filter by creator
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "projectId": 1,
      "projectName": "Website Redesign",
      "description": "Redesign company website",
      "createdBy": {
        "userId": 1,
        "username": "john_doe"
      },
      "createdAt": "2025-01-01T10:00:00Z",
      "taskCount": 15,
      "completedTasks": 5
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25
  }
}
```

---

### Get Project by ID
```http
GET /api/projects/:id
```

**Response (200):**
```json
{
  "projectId": 1,
  "projectName": "Website Redesign",
  "description": "Redesign company website",
  "createdBy": {
    "userId": 1,
    "username": "john_doe"
  },
  "createdAt": "2025-01-01T10:00:00Z",
  "taskLists": [
    {
      "listId": 1,
      "listName": "Pending",
      "taskCount": 5
    }
  ]
}
```

---

### Create New Project
```http
POST /api/projects
```

**Request Body:**
```json
{
  "projectName": "Mobile App Development",
  "description": "Build iOS and Android app"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Project created successfully",
  "projectId": 2
}
```

---

### Update Project
```http
PUT /api/projects/:id
```

**Request Body:**
```json
{
  "projectName": "Updated Project Name",
  "description": "Updated description"
}
```

---

### Delete Project
```http
DELETE /api/projects/:id
```

**Response (200):**
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

---

## Task List APIs

### Get Task Lists for Project
```http
GET /api/projects/:projectId/lists
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "listId": 1,
      "listName": "Pending",
      "projectId": 1,
      "taskCount": 5
    },
    {
      "listId": 2,
      "listName": "In Progress",
      "projectId": 1,
      "taskCount": 3
    }
  ]
}
```

---

### Create Task List
```http
POST /api/projects/:projectId/lists
```

**Request Body:**
```json
{
  "listName": "Testing"
}
```

---

### Update Task List
```http
PUT /api/lists/:id
```

**Request Body:**
```json
{
  "listName": "QA Testing"
}
```

---

### Delete Task List
```http
DELETE /api/lists/:id
```

---

## Task APIs

### Get All Tasks in List
```http
GET /api/lists/:listId/tasks
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "taskId": 1,
      "title": "Design Homepage",
      "description": "Create homepage mockup",
      "priority": "High",
      "status": "Pending",
      "dueDate": "2025-01-15",
      "assignedTo": {
        "userId": 2,
        "username": "jane_smith"
      },
      "createdAt": "2025-01-01T10:00:00Z"
    }
  ]
}
```

---

### Get Task by ID
```http
GET /api/tasks/:id
```

**Response (200):**
```json
{
  "taskId": 1,
  "title": "Design Homepage",
  "description": "Create homepage mockup",
  "priority": "High",
  "status": "Pending",
  "dueDate": "2025-01-15",
  "listId": 1,
  "assignedTo": {
    "userId": 2,
    "username": "jane_smith",
    "email": "jane@example.com"
  },
  "createdAt": "2025-01-01T10:00:00Z",
  "comments": [],
  "history": []
}
```

---

### Create New Task
```http
POST /api/lists/:listId/tasks
```

**Request Body:**
```json
{
  "title": "Implement Login Page",
  "description": "Create login UI with authentication",
  "priority": "High",
  "status": "Pending",
  "dueDate": "2025-01-20",
  "assignedTo": 2
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Task created successfully",
  "taskId": 15
}
```

---

### Update Task
```http
PUT /api/tasks/:id
```

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "priority": "Medium",
  "status": "In Progress",
  "dueDate": "2025-01-25",
  "assignedTo": 3
}
```

---

### Move Task to Different List
```http
PUT /api/tasks/:id/move
```

**Request Body:**
```json
{
  "listId": 2
}
```

---

### Delete Task
```http
DELETE /api/tasks/:id
```

---

### Get My Tasks
```http
GET /api/tasks/my-tasks
```

**Query Parameters:**
- `status` (optional): Filter by status
- `priority` (optional): Filter by priority
- `dueDate` (optional): Filter by due date

---

## Comment APIs

### Get Comments for Task
```http
GET /api/tasks/:taskId/comments
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "commentId": 1,
      "commentText": "Great work on this!",
      "user": {
        "userId": 1,
        "username": "john_doe"
      },
      "createdAt": "2025-01-02T14:30:00Z"
    }
  ]
}
```

---

### Add Comment to Task
```http
POST /api/tasks/:taskId/comments
```

**Request Body:**
```json
{
  "commentText": "I'll start working on this today"
}
```

---

### Update Comment
```http
PUT /api/comments/:id
```

**Request Body:**
```json
{
  "commentText": "Updated comment text"
}
```

---

### Delete Comment
```http
DELETE /api/comments/:id
```

---

## Task History APIs

### Get Task History
```http
GET /api/tasks/:taskId/history
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "historyId": 1,
      "changeType": "Status Changed",
      "changedBy": {
        "userId": 1,
        "username": "john_doe"
      },
      "changeTime": "2025-01-02T10:00:00Z"
    }
  ]
}
```

---

## Role Management APIs

### Get All Roles (Admin Only)
```http
GET /api/roles
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "roleId": 1,
      "roleName": "Admin"
    },
    {
      "roleId": 2,
      "roleName": "Project Manager"
    }
  ]
}
```

---

### Create New Role (Admin Only)
```http
POST /api/roles
```

**Request Body:**
```json
{
  "roleName": "Team Lead"
}
```

---

## Search & Filter APIs

### Advanced Task Search
```http
GET /api/search/tasks
```

**Query Parameters:**
- `q`: Search query (title/description)
- `priority`: Filter by priority
- `status`: Filter by status
- `assignedTo`: Filter by user ID
- `projectId`: Filter by project
- `dueDateFrom`: Start date
- `dueDateTo`: End date

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "taskId": 1,
      "title": "Design Homepage",
      "project": {
        "projectId": 1,
        "projectName": "Website Redesign"
      },
      "priority": "High",
      "status": "Pending"
    }
  ],
  "total": 15
}
```

---

## Analytics APIs

### Get Dashboard Statistics
```http
GET /api/analytics/dashboard
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalProjects": 10,
    "totalTasks": 85,
    "completedTasks": 42,
    "pendingTasks": 28,
    "inProgressTasks": 15,
    "myTasks": {
      "total": 12,
      "completed": 6,
      "pending": 4,
      "inProgress": 2
    },
    "upcomingDeadlines": [
      {
        "taskId": 5,
        "title": "Submit Report",
        "dueDate": "2025-01-05"
      }
    ]
  }
}
```

---

### Get Project Progress
```http
GET /api/analytics/projects/:projectId/progress
```

**Response (200):**
```json
{
  "projectId": 1,
  "projectName": "Website Redesign",
  "totalTasks": 20,
  "completedTasks": 8,
  "completionPercentage": 40,
  "tasksByStatus": {
    "Pending": 7,
    "In Progress": 5,
    "Completed": 8
  },
  "tasksByPriority": {
    "High": 5,
    "Medium": 10,
    "Low": 5
  }
}
```

---

### Get Team Workload
```http
GET /api/analytics/team-workload
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "userId": 2,
      "username": "jane_smith",
      "assignedTasks": 8,
      "completedTasks": 3,
      "pendingTasks": 3,
      "inProgressTasks": 2
    }
  ]
}
```

---

## Error Responses

All endpoints follow consistent error response format:

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Validation error",
  "details": {
    "field": "email",
    "message": "Invalid email format"
  }
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "error": "Authentication required"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "error": "Insufficient permissions"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Internal server error",
  "message": "Something went wrong"
}
```

---

## Authentication

Most endpoints require authentication via JWT token in the Authorization header:

```http
Authorization: Bearer <jwt_token>
```

Public endpoints (no authentication required):
- `POST /api/auth/register`
- `POST /api/auth/login`

---

## Next.js API Route Structure

```
app/
  api/
    auth/
      login/
        route.js
      register/
        route.js
      logout/
        route.js
    users/
      route.js
      me/
        route.js
        password/
          route.js
      [userId]/
        roles/
          route.js
    projects/
      route.js
      [id]/
        route.js
        lists/
          route.js
    lists/
      [id]/
        route.js
        tasks/
          route.js
    tasks/
      route.js
      my-tasks/
        route.js
      [id]/
        route.js
        move/
          route.js
        comments/
          route.js
        history/
          route.js
    comments/
      [id]/
        route.js
    roles/
      route.js
    search/
      tasks/
        route.js
    analytics/
      dashboard/
        route.js
      projects/
        [projectId]/
          progress/
            route.js
      team-workload/
        route.js
```
