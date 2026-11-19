export enum TaskStatus {
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  REVIEW = 'Review',
  COMPLETED = 'Completed',
}

export enum TaskPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  URGENT = 'Urgent',
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  due_date: Date | null;
  status: TaskStatus;
  priority: TaskPriority;
  user_id: number;
  assigned_to_id: number | null;
  created_at: Date;
  updated_at: Date;
}

export type CreateTaskInput = Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
export type UpdateTaskInput = Partial<CreateTaskInput>;