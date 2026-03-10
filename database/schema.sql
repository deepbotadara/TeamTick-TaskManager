-- ============================================
-- To-Do List Application - Database Schema
-- Database: todo_list
-- MySQL Database Schema
-- ============================================

-- Use the todo_list database
USE todo_list;

-- ============================================
-- Table: Users
-- Description: Stores user account information
-- ============================================
CREATE TABLE Users (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    UserName VARCHAR(50) NOT NULL UNIQUE,
    Email VARCHAR(100) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (Email),
    INDEX idx_username (UserName)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: Roles
-- Description: Stores role definitions (Admin, User, etc.)
-- ============================================
CREATE TABLE Roles (
    RoleID INT AUTO_INCREMENT PRIMARY KEY,
    RoleName VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: UserRoles
-- Description: Maps users to their assigned roles
-- ============================================
CREATE TABLE UserRoles (
    UserRoleID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    RoleID INT NOT NULL,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (RoleID) REFERENCES Roles(RoleID) ON DELETE CASCADE,
    UNIQUE KEY unique_user_role (UserID, RoleID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: Projects
-- Description: Stores project information
-- ============================================
CREATE TABLE Projects (
    ProjectID INT AUTO_INCREMENT PRIMARY KEY,
    ProjectName VARCHAR(100) NOT NULL,
    Description VARCHAR(255) NULL,
    CreatedBy INT NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID) ON DELETE RESTRICT,
    INDEX idx_created_by (CreatedBy),
    INDEX idx_created_at (CreatedAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: TaskLists
-- Description: Stores task lists within projects
-- ============================================
CREATE TABLE TaskLists (
    ListID INT AUTO_INCREMENT PRIMARY KEY,
    ProjectID INT NOT NULL,
    ListName VARCHAR(100) NOT NULL,
    FOREIGN KEY (ProjectID) REFERENCES Projects(ProjectID) ON DELETE CASCADE,
    INDEX idx_project_id (ProjectID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: Tasks
-- Description: Stores individual tasks
-- ============================================
CREATE TABLE Tasks (
    TaskID INT AUTO_INCREMENT PRIMARY KEY,
    ListID INT NOT NULL,
    AssignedTo INT NULL,
    Title VARCHAR(100) NOT NULL,
    Description VARCHAR(255) NULL,
    Priority VARCHAR(10) DEFAULT 'Medium',
    Status VARCHAR(20) DEFAULT 'Pending',
    DueDate DATE NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ListID) REFERENCES TaskLists(ListID) ON DELETE CASCADE,
    FOREIGN KEY (AssignedTo) REFERENCES Users(UserID) ON DELETE SET NULL,
    CONSTRAINT chk_priority CHECK (Priority IN ('Low', 'Medium', 'High')),
    CONSTRAINT chk_status CHECK (Status IN ('Pending', 'In Progress', 'Completed')),
    INDEX idx_list_id (ListID),
    INDEX idx_assigned_to (AssignedTo),
    INDEX idx_status (Status),
    INDEX idx_priority (Priority),
    INDEX idx_due_date (DueDate),
    INDEX idx_list_status (ListID, Status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: TaskComments
-- Description: Stores comments on tasks
-- ============================================
CREATE TABLE TaskComments (
    CommentID INT AUTO_INCREMENT PRIMARY KEY,
    TaskID INT NOT NULL,
    UserID INT NOT NULL,
    CommentText VARCHAR(255) NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (TaskID) REFERENCES Tasks(TaskID) ON DELETE CASCADE,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    INDEX idx_task_id (TaskID),
    INDEX idx_created_at (CreatedAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: TaskHistory
-- Description: Tracks changes made to tasks
-- ============================================
CREATE TABLE TaskHistory (
    HistoryID INT AUTO_INCREMENT PRIMARY KEY,
    TaskID INT NOT NULL,
    ChangedBy INT NOT NULL,
    ChangeType VARCHAR(50) NOT NULL,
    ChangeTime DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (TaskID) REFERENCES Tasks(TaskID) ON DELETE CASCADE,
    FOREIGN KEY (ChangedBy) REFERENCES Users(UserID) ON DELETE CASCADE,
    INDEX idx_task_id (TaskID),
    INDEX idx_change_time (ChangeTime)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- End of Schema
-- ============================================
