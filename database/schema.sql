-- Training Calendar Management System - Complete Database Schema
-- SQL Server / SSMS

CREATE DATABASE IF NOT EXISTS DTC;
GO
USE DTC;
GO

-- Roles table
CREATE TABLE roles (
  id INT IDENTITY(1,1) PRIMARY KEY,
  name NVARCHAR(100) NOT NULL UNIQUE,
  description NVARCHAR(255)
);

-- DMT (Department/Team) table
CREATE TABLE dmt (
  id INT IDENTITY(1,1) PRIMARY KEY,
  name NVARCHAR(150) NOT NULL,
  description NVARCHAR(255)
);

-- Department table
CREATE TABLE department (
  id INT IDENTITY(1,1) PRIMARY KEY,
  name NVARCHAR(150) NOT NULL,
  description NVARCHAR(255)
);

-- Positions (Unique Position Master)
CREATE TABLE positions (
  id INT IDENTITY(1,1) PRIMARY KEY,
  code NVARCHAR(50) UNIQUE NOT NULL,
  title NVARCHAR(150) NOT NULL,
  description NVARCHAR(255)
);

-- KSA (Knowledge/Skill/Attitude) Master
CREATE TABLE ksa (
  id INT IDENTITY(1,1) PRIMARY KEY,
  code NVARCHAR(50) UNIQUE NOT NULL,
  name NVARCHAR(150) NOT NULL,
  description NVARCHAR(400),
  category NVARCHAR(50)
);

-- Position-KSA mapping
CREATE TABLE position_ksa (
  id INT IDENTITY(1,1) PRIMARY KEY,
  positionId INT NOT NULL,
  ksaId INT NOT NULL,
  requiredLevel INT DEFAULT 1,
  FOREIGN KEY (positionId) REFERENCES positions(id) ON DELETE CASCADE,
  FOREIGN KEY (ksaId) REFERENCES ksa(id) ON DELETE CASCADE,
  UNIQUE(positionId, ksaId)
);

-- Users / Member Master (as per BRD section 4.3)
CREATE TABLE users (
  id INT IDENTITY(1,1) PRIMARY KEY,
  staffId NVARCHAR(50) UNIQUE NOT NULL, 
  employeeId NVARCHAR(50) UNIQUE,
  firstName NVARCHAR(100) NOT NULL,
  lastName NVARCHAR(100),
  email NVARCHAR(255) UNIQUE NOT NULL,
  passwordHash NVARCHAR(255) NOT NULL,
  department NVARCHAR(150),
  [function] NVARCHAR(150),
  [level] NVARCHAR(50),
  grade NVARCHAR(50),
  dmtId INT,
  managerId INT,
  positionId INT,
  roleId INT NOT NULL,
  status NVARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  createdAt DATETIME2 DEFAULT SYSUTCDATETIME(),
  updatedAt DATETIME2 DEFAULT SYSUTCDATETIME(),
  FOREIGN KEY (dmtId) REFERENCES dmt(id),
  FOREIGN KEY (managerId) REFERENCES users(id),
  FOREIGN KEY (positionId) REFERENCES positions(id),
  FOREIGN KEY (roleId) REFERENCES roles(id)
);

-- Trainings table
CREATE TABLE trainings (
  id INT IDENTITY(1,1) PRIMARY KEY,
  topic NVARCHAR(255) NOT NULL,
  description NVARCHAR(MAX),
  venueId INT,
  trainingStartDate DATETIME2,
  trainingEndDate DATETIME2,
  trainerId INT NOT NULL,
  duration INT, -- in hours
  categoryId INT,
  status NVARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled', 'completed')),
  createdBy INT,
  createdAt DATETIME2 DEFAULT SYSUTCDATETIME(),
  updatedAt DATETIME2 DEFAULT SYSUTCDATETIME(),
  FOREIGN KEY (createdBy) REFERENCES users(id),
  FOREIGN KEY (categoryId) REFERENCES categories(id),
  FOREIGN KEY (venueId) REFERENCES venues(id)
);

-- Assignments table
CREATE TABLE assignments (
  id INT IDENTITY(1,1) PRIMARY KEY,
  trainingId INT NOT NULL,
  assigneeType NVARCHAR(50) NOT NULL CHECK (assigneeType IN ('individual', 'grade', 'level', 'position', 'dmt', 'function')),
  assigneeId NVARCHAR(255), -- Can be user ID, grade name, level name, position ID, DMT ID, or function name
  assignedBy INT NOT NULL,
  createdAt DATETIME2 DEFAULT SYSUTCDATETIME(),
  updatedAt DATETIME2 DEFAULT SYSUTCDATETIME(),
  FOREIGN KEY (trainingId) REFERENCES trainings(id) ON DELETE CASCADE,
  FOREIGN KEY (assignedBy) REFERENCES users(id)
);

-- Assignment Recipients (individual members who received the assignment)
CREATE TABLE assignment_recipients (
  id INT IDENTITY(1,1) PRIMARY KEY,
  assignmentId INT NOT NULL,
  userId INT NOT NULL,
  status NVARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  notes NVARCHAR(MAX),
  createdAt DATETIME2 DEFAULT SYSUTCDATETIME(),
  updatedAt DATETIME2 DEFAULT SYSUTCDATETIME(),
  FOREIGN KEY (assignmentId) REFERENCES assignments(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(assignmentId, userId)
);

-- Venues table (for configurable training venues)
CREATE TABLE venues (
  id INT IDENTITY(1,1) PRIMARY KEY,
  name NVARCHAR(150) NOT NULL UNIQUE,
  description NVARCHAR(255),
  conferenceRoom NVARCHAR(255),
  is_active BIT DEFAULT 1,
  createdAt DATETIME2 DEFAULT SYSUTCDATETIME(),
  updatedAt DATETIME2 DEFAULT SYSUTCDATETIME()
);

-- Categories table (for configurable training categories)
CREATE TABLE categories (
  id INT IDENTITY(1,1) PRIMARY KEY,
  name NVARCHAR(100) NOT NULL UNIQUE,
  description NVARCHAR(255),
  is_active BIT DEFAULT 1,
  createdAt DATETIME2 DEFAULT SYSUTCDATETIME(),
  updatedAt DATETIME2 DEFAULT SYSUTCDATETIME()
);

-- Trainers Table (for input validation and trainer management)
CREATE TABLE trainers (
  id INT IDENTITY(1,1) PRIMARY KEY,
  trainerName NVARCHAR(100) NOT NULL UNIQUE,
  trainerType NVARCHAR(50) NOT NULL CHECK (trainerType IN ('internal', 'external')),
  profession NVARCHAR(100),
  company NVARCHAR(150),
  location NVARCHAR(150),
  qualification NVARCHAR(255),
  purpose NVARCHAR(MAX),
  categoryId INT,
  is_active BIT DEFAULT 1,
  createdAt DATETIME2 DEFAULT SYSUTCDATETIME(),
  updatedAt DATETIME2 DEFAULT SYSUTCDATETIME(),
  FOREIGN KEY (categoryId) REFERENCES categories(id)
);

-- Indexes for performance
CREATE INDEX IX_users_staffId ON users(staffId);
CREATE INDEX IX_users_employeeId ON users(employeeId);
CREATE INDEX IX_users_email ON users(email);
CREATE INDEX IX_users_dmtId ON users(dmtId);
CREATE INDEX IX_users_roleId ON users(roleId);
CREATE INDEX IX_users_status ON users(status);
CREATE INDEX IX_users_managerId ON users(managerId);
CREATE INDEX IX_users_positionId ON users(positionId);
CREATE INDEX IX_assignments_createdAt ON assignments(createdAt);
CREATE INDEX IX_assignments_trainingId_assigneeType ON assignments(trainingId, assigneeType);
CREATE INDEX IX_trainings_createdBy ON trainings(createdBy);
CREATE INDEX IX_trainings_status ON trainings(status);
CREATE INDEX IX_trainings_trainingStartDate ON trainings(trainingStartDate);
CREATE INDEX IX_trainings_trainingEndDate ON trainings(trainingEndDate);
CREATE INDEX IX_trainings_createdAt ON trainings(createdAt);
CREATE INDEX IX_assignments_trainingId ON assignments(trainingId);
CREATE INDEX IX_assignments_assignedBy ON assignments(assignedBy);
CREATE INDEX IX_assignments_assigneeType ON assignments(assigneeType);
CREATE INDEX IX_assignment_recipients_assignmentId ON assignment_recipients(assignmentId);
CREATE INDEX IX_assignment_recipients_userId ON assignment_recipients(userId);
CREATE INDEX IX_assignment_recipients_status ON assignment_recipients(status);
CREATE INDEX IX_trainings_trainerId ON trainings (trainerId);
CREATE INDEX IX_trainings_categoryId ON trainings (categoryId);
CREATE INDEX IX_categories_name ON categories(name);
CREATE INDEX IX_categories_is_active ON categories(is_active);
CREATE INDEX IX_trainers_trainerName ON trainers(trainerName);
CREATE INDEX IX_trainers_trainerType ON trainers(trainerType);
CREATE INDEX IX_trainers_categoryId ON trainers(categoryId);
CREATE INDEX IX_trainers_is_active ON trainers(is_active);
CREATE INDEX IX_venues_name ON venues(name);
CREATE INDEX IX_venues_is_active ON venues(is_active);
CREATE INDEX IX_trainings_venueId ON trainings(venueId);


/* CREATE INDEX IX_assignment_recipients_attendance ON assignment_recipients(attendance);*/

-- Insert default roles
INSERT INTO roles (name, description) VALUES
('Admin', 'System Administrator with full access'),
('HR Manager BCM', 'HR Manager BCM - Can assign trainings and manage masters'),
('HR Manager DHQ', 'HR Manager DHQ - Can assign trainings and manage masters'),
('PCOE', 'Process Centre of Excellence - Can assign trainings'),
('ICOE', 'ICOE member - Can assign trainings'),
('BE Cell Manager', 'BE Cell Manager - Can assign trainings'),
('L&D', 'Learning & Development pillar member - Can assign trainings'),
('DMT Leader', 'DMT Leader - Can assign trainings to their DMT'),
('Functional Head', 'Functional Head - Can assign trainings'),
('Manager', 'Manager - Can assign trainings to team and self'),
('ESP', 'ESP - Can self-assign trainings'),
('Employee', 'Employee - Can self-assign trainings');

-- Insert default categories
INSERT INTO categories (name, description, is_active) VALUES
('Appraisal', 'Appraisal related training', 1),
('Knowledge Gap', 'Training to address knowledge gaps', 1),
('DMT', 'DMT specific training', 1),
('Wellness', 'Wellness and health related training', 1);

-- Insert default venues
INSERT INTO venues (name, description, conferenceRoom, is_active) VALUES
('Conference Room A', 'Main conference room with AV equipment', 'Conference Room', 1),
('Training Room B', 'Dedicated training space with computers', 'Conference Room', 1),
('Virtual Classroom', 'Online training platform', 'Virtual', 1),
('Meeting Room C', 'Small meeting room for group discussions', 'Conference Room', 1),
('Auditorium', 'Large auditorium for presentations', 'Conference Room', 1);

GO

