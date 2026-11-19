// Task enums
export enum TaskStatus {
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  REVIEW = 'Review',
  COMPLETED = 'Completed'
}

export enum TaskPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  URGENT = 'Urgent'
}

// User interface
export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  created_at?: Date;
}

// Task interface
export interface Task {
  id: number;
  title: string;
  description: string | null;
  due_date: Date | null;
  priority: TaskPriority;
  status: TaskStatus;
  user_id: number;
  assigned_to_id?: number | null;
  created_at: Date;
  updated_at: Date;
}

// Input interfaces for creating/updating tasks
export interface CreateTaskInput {
  title: string;
  description?: string | null;
  due_date?: Date | null;
  priority?: TaskPriority;
  status?: TaskStatus;
  assigned_to_id?: number | null;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  due_date?: Date | null;
  priority?: TaskPriority;
  status?: TaskStatus;
  assigned_to_id?: number | null;
}

// JWT user payload
export interface JwtUser {
  id: number;
  email: string;
  iat?: number;
  exp?: number;
}

// Extend Express Request type
import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: JwtUser;
    }
  }
}