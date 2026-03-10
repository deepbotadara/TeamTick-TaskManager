# Database Setup Guide

This guide explains how to set up the MySQL database for the To-Do List application.

## Database Configuration

- **Database Name:** `todo_list`
- **Username:** `root`
- **Password:** `root`

## Prerequisites

- MySQL Server installed and running
- MySQL client or MySQL Workbench

## Setup Instructions

### Step 1: Create the Database Schema

Run the schema creation script to create all tables:

```bash
mysql -u root -proot todo_list < database/schema.sql
```

**Or using MySQL client:**

```sql
mysql -u root -proot
USE todo_list;
source database/schema.sql;
```

### Step 2: (Optional) Load Sample Data

Insert test data for development:

```bash
mysql -u root -proot todo_list < database/seed-data.sql
```

**Or using MySQL client:**

```sql
USE todo_list;
source database/seed-data.sql;
```

## Database Schema Overview

The database consists of 9 tables:

### Core Tables

1. **Users** - User account information
2. **Roles** - Role definitions (Admin, User, etc.)
3. **UserRoles** - User-to-role mapping

### Project Management

4. **Projects** - Project information
5. **TaskLists** - Task lists within projects (Pending, In Progress, Completed)
6. **Tasks** - Individual tasks

### Task Tracking

7. **TaskComments** - Comments on tasks
8. **TaskHistory** - Task change history

## Verify Installation

Check that all tables were created successfully:

```sql
mysql -u root -proot -e "USE todo_list; SHOW TABLES;"
```

You should see all 9 tables listed.

### Verify Sample Data

```sql
mysql -u root -proot -e "USE todo_list; SELECT * FROM Users;"
mysql -u root -proot -e "USE todo_list; SELECT * FROM Projects;"
mysql -u root -proot -e "USE todo_list; SELECT * FROM Tasks;"
```

## Entity Relationships

```
Users ──┬─── Creates ──→ Projects
        │
        ├─── Has ──→ UserRoles ──→ Roles
        │
        ├─── Assigned To ──→ Tasks
        │
        ├─── Comments On ──→ TaskComments
        │
        └─── Changes ──→ TaskHistory

Projects ──→ Contains ──→ TaskLists ──→ Contains ──→ Tasks
                                                      │
                                                      ├──→ TaskComments
                                                      │
                                                      └──→ TaskHistory
```

## Table Details

### Users Table
- Primary Key: `UserID` (Auto-increment)
- Unique constraints on `UserName` and `Email`
- Stores password hash (never plain text)

### Roles Table
- Primary Key: `RoleID` (Auto-increment)
- Supports role-based access control

### Projects Table
- Primary Key: `ProjectID` (Auto-increment)
- Foreign Key: `CreatedBy` → `Users(UserID)`

### TaskLists Table
- Primary Key: `ListID` (Auto-increment)
- Foreign Key: `ProjectID` → `Projects(ProjectID)`
- Represents Kanban columns (Pending, In Progress, Completed)

### Tasks Table
- Primary Key: `TaskID` (Auto-increment)
- Foreign Keys: 
  - `ListID` → `TaskLists(ListID)`
  - `AssignedTo` → `Users(UserID)`
- Status: Pending | In Progress | Completed
- Priority: Low | Medium | High

### TaskComments Table
- Primary Key: `CommentID` (Auto-increment)
- Foreign Keys:
  - `TaskID` → `Tasks(TaskID)`
  - `UserID` → `Users(UserID)`

### TaskHistory Table
- Primary Key: `HistoryID` (Auto-increment)
- Foreign Keys:
  - `TaskID` → `Tasks(TaskID)`
  - `ChangedBy` → `Users(UserID)`
- Tracks all changes to tasks

## Performance Optimizations

The schema includes indexes on:
- Email and Username lookups
- Task filtering by status, priority, assignee
- Project and list relationships
- Comment and history timestamps

## Next Steps

1. ✅ Database schema created
2. 📝 Configure Next.js database connection
3. 🔧 Build API endpoints
4. 🧪 Test CRUD operations
