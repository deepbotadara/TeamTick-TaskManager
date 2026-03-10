# Data Flow Mapping

## Overview

This document visualizes how data flows through the To-Do List application, from user interactions to database operations and API responses.

---

## System Architecture

```mermaid
graph TB
    subgraph Client["Client Layer (Browser)"]
        UI[React/Next.js UI]
    end
    
    subgraph Server["Next.js Server"]
        API[API Routes]
        Auth[Auth Middleware]
        DB_Conn[Database Connection]
    end
    
    subgraph Database["MySQL Database"]
        Tables[(Database Tables)]
    end
    
    UI -->|HTTP Requests| API
    API -->|Verify Token| Auth
    Auth -->|Execute Query| DB_Conn
    DB_Conn -->|SQL| Tables
    Tables -->|Result Set| DB_Conn
    DB_Conn -->|Data| API
    API -->|JSON Response| UI
```

---

## User Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant UI as Next.js UI
    participant API as /api/auth/login
    participant DB as MySQL Database
    
    User->>UI: Enter credentials
    UI->>API: POST /api/auth/login
    API->>DB: SELECT user WHERE email = ?
    DB-->>API: User record
    API->>API: Verify password hash
    alt Password Valid
        API->>API: Generate JWT token
        API-->>UI: {success: true, token, user}
        UI->>UI: Store token in localStorage
        UI-->>User: Redirect to Dashboard
    else Password Invalid
        API-->>UI: {success: false, error}
        UI-->>User: Show error message
    end
```

---

## User Registration Flow

```mermaid
sequenceDiagram
    participant User
    participant UI as Next.js UI
    participant API as /api/auth/register
    participant DB as MySQL Database
    
    User->>UI: Fill registration form
    UI->>API: POST /api/auth/register
    API->>API: Validate input data
    API->>API: Hash password
    API->>DB: INSERT INTO Users
    DB-->>API: New UserID
    API->>DB: INSERT INTO UserRoles (default: User)
    DB-->>API: Success
    API-->>UI: {success: true, userId}
    UI-->>User: Show success, redirect to login
```

---

## Project Creation Flow

```mermaid
sequenceDiagram
    participant User
    participant UI as Next.js UI
    participant Auth as Auth Middleware
    participant API as /api/projects
    participant DB as MySQL Database
    
    User->>UI: Click "New Project"
    UI->>UI: Show project form
    User->>UI: Submit project details
    UI->>API: POST /api/projects<br/>{projectName, description}
    API->>Auth: Verify JWT token
    Auth-->>API: User authenticated
    API->>DB: INSERT INTO Projects<br/>(projectName, description, createdBy)
    DB-->>API: ProjectID = 5
    API->>DB: Create default task lists<br/>(Pending, In Progress, Completed)
    DB-->>API: Success
    API-->>UI: {success: true, projectId: 5}
    UI-->>User: Redirect to project view
```

---

## Task Creation Flow

```mermaid
sequenceDiagram
    participant User
    participant UI as Task Board
    participant API as /api/lists/:listId/tasks
    participant History as Task History
    participant DB as MySQL Database
    
    User->>UI: Click "Add Task"
    UI->>UI: Show task form
    User->>UI: Fill task details
    UI->>API: POST /api/lists/:listId/tasks<br/>{title, description, priority, assignedTo, dueDate}
    API->>DB: INSERT INTO Tasks
    DB-->>API: TaskID = 25
    API->>History: Log task creation
    History->>DB: INSERT INTO TaskHistory<br/>(taskId, changeType: "Created")
    DB-->>API: Success
    API-->>UI: {success: true, taskId: 25}
    UI->>UI: Add task to Kanban board
    UI-->>User: Show new task card
```

---

## Task Update Flow (Drag & Drop)

```mermaid
sequenceDiagram
    participant User
    participant UI as Kanban Board
    participant API as /api/tasks/:id/move
    participant History as Task History Service
    participant DB as MySQL Database
    
    User->>UI: Drag task to "In Progress"
    UI->>API: PUT /api/tasks/:id/move<br/>{listId: 2}
    API->>DB: UPDATE Tasks<br/>SET listId = 2, status = "In Progress"
    DB-->>API: Success
    API->>History: Log status change
    History->>DB: INSERT INTO TaskHistory<br/>(changeType: "Status Changed")
    DB-->>API: Success
    API-->>UI: {success: true}
    UI->>UI: Update task position visually
    UI-->>User: Show task in new column
```

---

## Task Comment Flow

```mermaid
sequenceDiagram
    participant User
    participant UI as Task Detail View
    participant API as /api/tasks/:id/comments
    participant Notification as Notification Service
    participant DB as MySQL Database
    
    User->>UI: Type comment
    User->>UI: Click "Post Comment"
    UI->>API: POST /api/tasks/:id/comments<br/>{commentText}
    API->>DB: INSERT INTO TaskComments<br/>(taskId, userId, commentText)
    DB-->>API: CommentID = 15
    API->>Notification: Notify assigned user
    Notification->>Notification: Send notification (future feature)
    API-->>UI: {success: true, comment: {...}}
    UI->>UI: Append comment to list
    UI-->>User: Show new comment
```

---

## Search Tasks Flow

```mermaid
sequenceDiagram
    participant User
    participant UI as Search Page
    participant API as /api/search/tasks
    participant DB as MySQL Database
    
    User->>UI: Enter search query + filters
    UI->>API: GET /api/search/tasks?q=bug&priority=High&status=Pending
    API->>DB: Complex SELECT with JOINs<br/>Tasks + Users + Projects + TaskLists
    Note over DB: WHERE title LIKE '%bug%'<br/>AND priority = 'High'<br/>AND status = 'Pending'
    DB-->>API: Result set (10 tasks)
    API->>API: Format and enrich data
    API-->>UI: {success: true, data: [...], total: 10}
    UI->>UI: Display results in grid
    UI-->>User: Show search results
```

---

## Dashboard Statistics Flow

```mermaid
sequenceDiagram
    participant User
    participant UI as Dashboard
    participant API as /api/analytics/dashboard
    participant DB as MySQL Database
    
    User->>UI: Navigate to Dashboard
    UI->>API: GET /api/analytics/dashboard
    API->>DB: Multiple aggregation queries
    Note over DB: COUNT tasks by status<br/>GROUP BY status
    DB-->>API: Status counts
    API->>DB: Get my assigned tasks
    DB-->>API: User tasks
    API->>DB: Get upcoming deadlines
    DB-->>API: Tasks with due dates
    API->>API: Combine all statistics
    API-->>UI: {totalTasks, completedTasks, myTasks, upcomingDeadlines}
    UI->>UI: Render charts and widgets
    UI-->>User: Show dashboard
```

---

## Complete Request-Response Cycle

```mermaid
graph LR
    A[User Action] --> B[Next.js UI Component]
    B --> C{Authenticated?}
    C -->|Yes| D[API Request with JWT]
    C -->|No| E[Redirect to Login]
    D --> F[Next.js API Route Handler]
    F --> G[Auth Middleware]
    G --> H{Valid Token?}
    H -->|Yes| I[Execute Business Logic]
    H -->|No| J[Return 401 Error]
    I --> K[Database Operation]
    K --> L[MySQL Database]
    L --> M[Return Data]
    M --> N[Format JSON Response]
    N --> O[Send to Client]
    O --> P[Update UI State]
    P --> Q[Re-render Component]
    Q --> R[User Sees Update]
```

---

## Database Query Flow: Get Project with Tasks

```mermaid
graph TB
    Start[GET /api/projects/:id] --> Auth[Authenticate User]
    Auth --> Q1[Query 1: Get Project]
    Q1 --> Q2[Query 2: Get Creator Info]
    Q2 --> Q3[Query 3: Get Task Lists]
    Q3 --> Q4[Query 4: Get Tasks for Each List]
    Q4 --> Q5[Query 5: Get Assignee Info]
    Q5 --> Combine[Combine All Data]
    Combine --> Format[Format JSON Response]
    Format --> End[Return to Client]
    
    style Start fill:#e1f5ff
    style End fill:#c8e6c9
    style Q1 fill:#fff9c4
    style Q2 fill:#fff9c4
    style Q3 fill:#fff9c4
    style Q4 fill:#fff9c4
    style Q5 fill:#fff9c4
```

**Optimized Alternative (Using JOINs):**
```sql
SELECT 
    p.*,
    u.UserName as CreatorName,
    tl.ListID,
    tl.ListName,
    COUNT(t.TaskID) as TaskCount
FROM Projects p
LEFT JOIN Users u ON p.CreatedBy = u.UserID
LEFT JOIN TaskLists tl ON p.ProjectID = tl.ProjectID
LEFT JOIN Tasks t ON tl.ListID = t.ListID
WHERE p.ProjectID = ?
GROUP BY p.ProjectID, tl.ListID
```

---

## Error Handling Flow

```mermaid
graph TB
    Request[API Request] --> Validate{Input Valid?}
    Validate -->|No| Return400[Return 400 Bad Request]
    Validate -->|Yes| CheckAuth{Authenticated?}
    CheckAuth -->|No| Return401[Return 401 Unauthorized]
    CheckAuth -->|Yes| CheckPerm{Has Permission?}
    CheckPerm -->|No| Return403[Return 403 Forbidden]
    CheckPerm -->|Yes| Execute[Execute Database Query]
    Execute --> DBCheck{DB Success?}
    DBCheck -->|No| Return500[Return 500 Server Error]
    DBCheck -->|Yes| NotFound{Resource Found?}
    NotFound -->|No| Return404[Return 404 Not Found]
    NotFound -->|Yes| Return200[Return 200 Success]
    
    style Return400 fill:#ffccbc
    style Return401 fill:#ffccbc
    style Return403 fill:#ffccbc
    style Return404 fill:#ffccbc
    style Return500 fill:#ffccbc
    style Return200 fill:#c8e6c9
```

---

## Data Flow Layers

### Layer 1: Presentation (Client)
- **Technology**: React/Next.js Components
- **Responsibility**: Display UI, handle user input, make API calls
- **Data Format**: JSON (received from API)

### Layer 2: API (Server)
- **Technology**: Next.js API Routes
- **Responsibility**: Request validation, authentication, business logic, database operations
- **Data Format**: JSON (send/receive)

### Layer 3: Database (Persistence)
- **Technology**: MySQL
- **Responsibility**: Data storage, enforce constraints, execute queries
- **Data Format**: Relational tables

---

## Key Data Transformations

### 1. Client to Server
```javascript
// Client sends
const taskData = {
  title: "Fix bug",
  priority: "High",
  dueDate: "2025-01-15"
};

fetch('/api/tasks', {
  method: 'POST',
  body: JSON.stringify(taskData)
});
```

### 2. Server to Database
```javascript
// Server transforms and inserts
const query = `
  INSERT INTO Tasks (Title, Priority, DueDate, ListID, AssignedTo, Status, CreatedAt)
  VALUES (?, ?, ?, ?, ?, 'Pending', NOW())
`;
await db.query(query, [taskData.title, taskData.priority, taskData.dueDate, listId, userId]);
```

### 3. Database to Server
```javascript
// Database returns raw data
[{
  TaskID: 1,
  Title: "Fix bug",
  Priority: "High",
  DueDate: "2025-01-15T00:00:00Z"
}]
```

### 4. Server to Client
```javascript
// Server formats response
{
  success: true,
  data: {
    taskId: 1,
    title: "Fix bug",
    priority: "High",
    dueDate: "2025-01-15",
    createdAt: "2025-01-01T10:00:00Z"
  }
}
```

---

## Middleware Chain

```mermaid
graph LR
    A[HTTP Request] --> B[CORS Middleware]
    B --> C[Body Parser]
    C --> D[JWT Auth Middleware]
    D --> E[Role Check Middleware]
    E --> F[Rate Limiter]
    F --> G[Route Handler]
    G --> H[Response]
```

---

## Optimized Query Strategies

### Strategy 1: Eager Loading (JOINs)
- Use for related data that's always needed
- Example: Get task with assignee info

### Strategy 2: Lazy Loading (Separate Queries)
- Use for optional/conditional data
- Example: Load comments only when task detail is opened

### Strategy 3: Pagination
- Use for large result sets
- Example: Task list with 100+ tasks

### Strategy 4: Caching
- Use for frequently accessed, rarely changed data
- Example: User roles, project lists

---

## Real-Time Data Flow (Future Enhancement)

```mermaid
sequenceDiagram
    participant User1
    participant UI1 as User 1 Browser
    participant Server as Next.js + WebSocket
    participant UI2 as User 2 Browser
    participant User2
    
    User1->>UI1: Update task status
    UI1->>Server: Send update via WebSocket
    Server->>Server: Update database
    Server->>UI2: Broadcast update
    UI2->>UI2: Update UI automatically
    UI2-->>User2: See real-time change
```

---

## Summary

### Key Data Flows
1. **Authentication**: User credentials → JWT token
2. **CRUD Operations**: User action → API → Database → Response
3. **Search/Filter**: Query params → Complex SQL → Formatted results
4. **Analytics**: Multiple queries → Aggregation → Statistics
5. **History Tracking**: Any task change → Automatic history entry

### Performance Considerations
- Use database indexes for frequently queried fields
- Implement pagination for large datasets
- Join tables efficiently to minimize round trips
- Cache static/rarely-changing data
- Use connection pooling for database

### Security in Data Flow
- All requests pass through JWT authentication
- Role-based access control at API level
- SQL injection prevention via parameterized queries
- Input validation before database operations
- Password hashing (bcrypt) before storage
