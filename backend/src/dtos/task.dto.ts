import { z } from 'zod';
import { TaskPriority, TaskStatus } from '../types';

// These are the actual Zod schemas (values)
export const CreateTaskDto = z.object({
  title: z.string().min(1).max(100, 'Title must be 100 characters or less'),
  description: z.string().optional(),
  due_date: z.string().datetime().optional().nullable(),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.TODO),
  assigned_to_id: z.number().optional().nullable()
});

export const UpdateTaskDto = CreateTaskDto.partial();

export const FilterTasksDto = z.object({
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  sort_by: z.enum(['due_date', 'created_at', 'priority']).optional(),
  sort_order: z.enum(['asc', 'desc']).optional().default('asc'),
  assigned_to_me: z.boolean().optional(),
  created_by_me: z.boolean().optional(),
  overdue: z.boolean().optional(),
});

// These are the TypeScript types (inferred from the schemas)
export type CreateTaskDtoType = z.infer<typeof CreateTaskDto>;
export type UpdateTaskDtoType = z.infer<typeof UpdateTaskDto>;
export type FilterTasksDtoType = z.infer<typeof FilterTasksDto>;