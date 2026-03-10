# API CRUD Operations Mapping

## Overview

This document provides a complete mapping of all CRUD (Create, Read, Update, Delete) operations for each entity in the To-Do List application.

---

## Users

| Operation | HTTP Method | Endpoint | Description | Auth Required | Role Required |
|-----------|-------------|----------|-------------|---------------|---------------|
| **Create** | POST | `/api/auth/register` | Register new user | ❌ No | - |
| **Read** | GET | `/api/users/me` | Get current user profile | ✅ Yes | - |
| **Read** | GET | `/api/users` | Get all users | ✅ Yes | Admin |
| **Read** | GET | `/api/users/:id` | Get user by ID | ✅ Yes | Admin |
| **Update** | PUT | `/api/users/me` | Update current user profile | ✅ Yes | - |
| **Update** | PUT | `/api/users/me/password` | Change password | ✅ Yes | - |
| **Delete** | DELETE | `/api/users/:id` | Delete user | ✅ Yes | Admin |

---

## Roles

| Operation | HTTP Method | Endpoint | Description | Auth Required | Role Required |
|-----------|-------------|----------|-------------|---------------|---------------|
| **Create** | POST | `/api/roles` | Create new role | ✅ Yes | Admin |
| **Read** | GET | `/api/roles` | Get all roles | ✅ Yes | Admin |
| **Read** | GET | `/api/roles/:id` | Get role by ID | ✅ Yes | Admin |
| **Update** | PUT | `/api/roles/:id` | Update role | ✅ Yes | Admin |
| **Delete** | DELETE | `/api/roles/:id` | Delete role | ✅ Yes | Admin |

---

## User Roles (Assignment)

| Operation | HTTP Method | Endpoint | Description | Auth Required | Role Required |
|-----------|-------------|----------|-------------|---------------|---------------|
| **Create** | POST | `/api/users/:userId/roles` | Assign role to user | ✅ Yes | Admin |
| **Read** | GET | `/api/users/:userId/roles` | Get user's roles | ✅ Yes | - |
| **Delete** | DELETE | `/api/users/:userId/roles/:roleId` | Remove role from user | ✅ Yes | Admin |

---

## Projects

| Operation | HTTP Method | Endpoint | Description | Auth Required | Role Required |
|-----------|-------------|----------|-------------|---------------|---------------|
| **Create** | POST | `/api/projects` | Create new project | ✅ Yes | - |
| **Read** | GET | `/api/projects` | Get all projects | ✅ Yes | - |
| **Read** | GET | `/api/projects/:id` | Get project by ID | ✅ Yes | - |
| **Update** | PUT | `/api/projects/:id` | Update project | ✅ Yes | Creator/Admin |
| **Delete** | DELETE | `/api/projects/:id` | Delete project | ✅ Yes | Creator/Admin |

---

## Task Lists

| Operation | HTTP Method | Endpoint | Description | Auth Required | Role Required |
|-----------|-------------|----------|-------------|---------------|---------------|
| **Create** | POST | `/api/projects/:projectId/lists` | Create task list in project | ✅ Yes | - |
| **Read** | GET | `/api/projects/:projectId/lists` | Get all lists in project | ✅ Yes | - |
| **Read** | GET | `/api/lists/:id` | Get task list by ID | ✅ Yes | - |
| **Update** | PUT | `/api/lists/:id` | Update task list name | ✅ Yes | - |
| **Delete** | DELETE | `/api/lists/:id` | Delete task list | ✅ Yes | Project Creator/Admin |

---

## Tasks

| Operation | HTTP Method | Endpoint | Description | Auth Required | Role Required |
|-----------|-------------|----------|-------------|---------------|---------------|
| **Create** | POST | `/api/lists/:listId/tasks` | Create new task | ✅ Yes | - |
| **Read** | GET | `/api/tasks` | Get all tasks | ✅ Yes | - |
| **Read** | GET | `/api/tasks/:id` | Get task by ID | ✅ Yes | - |
| **Read** | GET | `/api/tasks/my-tasks` | Get current user's tasks | ✅ Yes | - |
| **Read** | GET | `/api/lists/:listId/tasks` | Get all tasks in list | ✅ Yes | - |
| **Update** | PUT | `/api/tasks/:id` | Update task details | ✅ Yes | - |
| **Update** | PUT | `/api/tasks/:id/move` | Move task to different list | ✅ Yes | - |
| **Delete** | DELETE | `/api/tasks/:id` | Delete task | ✅ Yes | - |

---

## Task Comments

| Operation | HTTP Method | Endpoint | Description | Auth Required | Role Required |
|-----------|-------------|----------|-------------|---------------|---------------|
| **Create** | POST | `/api/tasks/:taskId/comments` | Add comment to task | ✅ Yes | - |
| **Read** | GET | `/api/tasks/:taskId/comments` | Get all comments for task | ✅ Yes | - |
| **Read** | GET | `/api/comments/:id` | Get comment by ID | ✅ Yes | - |
| **Update** | PUT | `/api/comments/:id` | Update comment | ✅ Yes | Comment Author |
| **Delete** | DELETE | `/api/comments/:id` | Delete comment | ✅ Yes | Comment Author/Admin |

---

## Task History

| Operation | HTTP Method | Endpoint | Description | Auth Required | Role Required |
|-----------|-------------|----------|-------------|---------------|---------------|
| **Create** | *Automatic* | - | Created automatically on task changes | - | - |
| **Read** | GET | `/api/tasks/:taskId/history` | Get task change history | ✅ Yes | - |

---

## Search & Filter

| Operation | HTTP Method | Endpoint | Description | Auth Required | Role Required |
|-----------|-------------|----------|-------------|---------------|---------------|
| **Read** | GET | `/api/search/tasks` | Advanced task search | ✅ Yes | - |
| **Read** | GET | `/api/search/projects` | Search projects | ✅ Yes | - |

---

## Analytics

| Operation | HTTP Method | Endpoint | Description | Auth Required | Role Required |
|-----------|-------------|----------|-------------|---------------|---------------|
| **Read** | GET | `/api/analytics/dashboard` | Get dashboard statistics | ✅ Yes | - |
| **Read** | GET | `/api/analytics/projects/:id/progress` | Get project progress | ✅ Yes | - |
| **Read** | GET | `/api/analytics/team-workload` | Get team workload distribution | ✅ Yes | Project Manager/Admin |

---

## CRUD Operations Summary

| Entity | Create | Read | Update | Delete | Special Operations |
|--------|--------|------|--------|--------|-------------------|
| **Users** | ✅ | ✅ | ✅ | ✅ | Login, Logout, Change Password |
| **Roles** | ✅ | ✅ | ✅ | ✅ | Assign to Users |
| **Projects** | ✅ | ✅ | ✅ | ✅ | - |
| **Task Lists** | ✅ | ✅ | ✅ | ✅ | - |
| **Tasks** | ✅ | ✅ | ✅ | ✅ | Move, Assign, My Tasks |
| **Comments** | ✅ | ✅ | ✅ | ✅ | - |
| **Task History** | Auto | ✅ | ❌ | ❌ | Read-only audit log |

---

## HTTP Methods Used

- **GET** - Retrieve resources (Read)
- **POST** - Create new resources (Create)
- **PUT** - Update existing resources (Update)
- **DELETE** - Remove resources (Delete)

---

## Authentication & Authorization Summary

### Public Endpoints (No Auth Required)
- `POST /api/auth/register`
- `POST /api/auth/login`

### User Endpoints (Login Required)
- All task operations
- All project operations
- All comment operations
- Personal profile management

### Admin-Only Endpoints
- User management (create, delete users)
- Role management
- System-wide analytics

### Creator/Owner Permissions
- Project deletion (only by creator)
- Comment deletion (only by author)

---

## API Rate Limiting (Recommended)

| Endpoint Type | Rate Limit | Window |
|---------------|------------|--------|
| Authentication | 5 requests | 15 minutes |
| Read Operations | 100 requests | 1 minute |
| Write Operations | 30 requests | 1 minute |
| Search/Analytics | 20 requests | 1 minute |

---

## Next.js Implementation Notes

### App Router Structure (Recommended)
```
app/api/
  [entity]/
    route.js        → GET (list all) & POST (create)
    [id]/
      route.js      → GET (one), PUT (update), DELETE
```

### HTTP Methods in Next.js Route Handlers
```javascript
// app/api/tasks/route.js
export async function GET(request) { /* List all tasks */ }
export async function POST(request) { /* Create task */ }

// app/api/tasks/[id]/route.js
export async function GET(request, { params }) { /* Get one task */ }
export async function PUT(request, { params }) { /* Update task */ }
export async function DELETE(request, { params }) { /* Delete task */ }
```

---

## Database Operations Mapping

| HTTP Method | CRUD Operation | SQL Query |
|-------------|----------------|-----------|
| POST | Create | `INSERT INTO` |
| GET | Read | `SELECT FROM` |
| PUT | Update | `UPDATE SET` |
| DELETE | Delete | `DELETE FROM` |
