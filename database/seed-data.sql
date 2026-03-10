-- ============================================
-- Sample Seed Data for To-Do List Application
-- Purpose: Test data for development and testing
-- ============================================

USE todo_list;

-- ============================================
-- Insert Roles
-- ============================================
INSERT INTO Roles (RoleName) VALUES 
    ('Admin'),
    ('Project Manager'),
    ('User');

-- ============================================
-- Insert Sample Users
-- Password: "password123" (hashed with bcrypt)
-- Note: In production, use proper password hashing
-- ============================================
INSERT INTO Users (UserName, Email, PasswordHash) VALUES 
    ('admin', 'admin@todolist.com', '$2b$10$YourHashedPasswordHere1'),
    ('john_doe', 'john@example.com', '$2b$10$YourHashedPasswordHere2'),
    ('jane_smith', 'jane@example.com', '$2b$10$YourHashedPasswordHere3'),
    ('bob_wilson', 'bob@example.com', '$2b$10$YourHashedPasswordHere4');

-- ============================================
-- Assign Roles to Users
-- ============================================
INSERT INTO UserRoles (UserID, RoleID) VALUES 
    (1, 1), -- admin is Admin
    (2, 2), -- john_doe is Project Manager
    (3, 3), -- jane_smith is User
    (4, 3); -- bob_wilson is User

-- ============================================
-- Insert Sample Projects
-- ============================================
INSERT INTO Projects (ProjectName, Description, CreatedBy) VALUES 
    ('Website Redesign', 'Redesign the company website with modern UI/UX', 1),
    ('Mobile App Development', 'Develop iOS and Android mobile application', 2),
    ('Marketing Campaign Q1', 'Q1 2025 marketing campaign planning and execution', 2);

-- ============================================
-- Insert Task Lists for Projects
-- ============================================
INSERT INTO TaskLists (ProjectID, ListName) VALUES 
    (1, 'Pending'),
    (1, 'In Progress'),
    (1, 'Completed'),
    (2, 'Pending'),
    (2, 'In Progress'),
    (2, 'Completed'),
    (3, 'Pending'),
    (3, 'In Progress'),
    (3, 'Completed');

-- ============================================
-- Insert Sample Tasks
-- ============================================
INSERT INTO Tasks (ListID, AssignedTo, Title, Description, Priority, Status, DueDate) VALUES 
    -- Website Redesign Project
    (1, 3, 'Design Homepage Mockup', 'Create initial homepage design mockup', 'High', 'Pending', '2025-01-15'),
    (2, 3, 'Develop Navigation Component', 'Build responsive navigation component', 'Medium', 'In Progress', '2025-01-10'),
    (3, 4, 'Setup Project Repository', 'Initialize Git repository and setup CI/CD', 'High', 'Completed', '2024-12-28'),
    
    -- Mobile App Development Project
    (4, 2, 'API Integration Planning', 'Plan API endpoints for mobile app', 'High', 'Pending', '2025-01-20'),
    (5, 2, 'User Authentication Module', 'Implement login and registration', 'High', 'In Progress', '2025-01-18'),
    (6, 3, 'Database Schema Design', 'Design mobile app database schema', 'Medium', 'Completed', '2024-12-25'),
    
    -- Marketing Campaign Project
    (7, 4, 'Competitor Analysis', 'Analyze competitor marketing strategies', 'Medium', 'Pending', '2025-02-01'),
    (8, 4, 'Social Media Content Plan', 'Create content calendar for social media', 'Low', 'In Progress', '2025-01-25');

-- ============================================
-- Insert Sample Task Comments
-- ============================================
INSERT INTO TaskComments (TaskID, UserID, CommentText) VALUES 
    (1, 2, 'Please ensure the design follows our brand guidelines'),
    (1, 3, 'I will have the initial mockup ready by Friday'),
    (2, 4, 'Great progress! The navigation looks good'),
    (5, 1, 'Make sure to implement JWT token authentication'),
    (8, 2, 'Let me know if you need any marketing materials');

-- ============================================
-- Insert Sample Task History
-- ============================================
INSERT INTO TaskHistory (TaskID, ChangedBy, ChangeType) VALUES 
    (1, 2, 'Task Created'),
    (2, 3, 'Status Changed to In Progress'),
    (3, 4, 'Status Changed to Completed'),
    (5, 2, 'Task Assigned to User'),
    (5, 2, 'Priority Set to High');

-- ============================================
-- End of Seed Data
-- ============================================
