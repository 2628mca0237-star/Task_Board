import { TaskRepository } from '../repositories/task.repository';
import { Task, CreateTaskInput, UpdateTaskInput, TaskStatus } from '../types';

export class TaskService {
  private taskRepository: TaskRepository;

  constructor() {
    this.taskRepository = new TaskRepository();
  }

  async createTask(userId: number, data: CreateTaskInput): Promise<Task> {
    const taskData = {
      ...data,
      user_id: userId
    };
    
    const task = await this.taskRepository.create(taskData);
    
    return task;
  }

  async updateTask(taskId: number, userId: number, data: UpdateTaskInput): Promise<Task> {
    const currentTask = await this.taskRepository.findById(taskId);
    
    if (!currentTask) {
      throw new Error('Task not found');
    }
    
    if (currentTask.user_id !== userId) {
      throw new Error('Not authorized to update this task');
    }
    
    const updatedTask = await this.taskRepository.update(taskId, data);
    
    return updatedTask;
  }

  async getDashboardData(userId: number) {
    const [assignedTasks, createdTasks, overdueTasks] = await Promise.all([
      this.taskRepository.findByAssignee(userId),
      this.taskRepository.findByUser(userId),
      this.taskRepository.findOverdue(userId)
    ]);

    return {
      assignedTasks,
      createdTasks,
      overdueTasks,
      stats: {
        total: assignedTasks.length + createdTasks.length,
        assigned: assignedTasks.length,
        created: createdTasks.length,
        overdue: overdueTasks.length
      }
    };
  }

  async getTasksWithFilters(userId: number, filters: any): Promise<Task[]> {
    let query = 'SELECT * FROM tasks WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;

    if (filters.assigned_to_me) {
      query += ` AND assigned_to_id = $${paramCount}`;
      params.push(userId);
      paramCount++;
    }

    if (filters.created_by_me) {
      query += ` AND user_id = $${paramCount}`;
      params.push(userId);
      paramCount++;
    }

    if (filters.status) {
      query += ` AND status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    if (filters.priority) {
      query += ` AND priority = $${paramCount}`;
      params.push(filters.priority);
      paramCount++;
    }

    if (filters.overdue) {
      query += ` AND due_date < NOW() AND status != $${paramCount}`;
      params.push(TaskStatus.COMPLETED);
      paramCount++;
    }

    if (filters.sort_by) {
      const sortOrder = filters.sort_order || 'asc';
      query += ` ORDER BY ${filters.sort_by} ${sortOrder.toUpperCase()}`;
    } else {
      query += ' ORDER BY created_at DESC';
    }

    const result = await this.taskRepository.executeQuery(query, params);
    return result;
  }

  async assignTask(taskId: number, assigneeId: number, userId: number): Promise<Task> {
    const task = await this.taskRepository.findById(taskId);
    
    if (!task) {
      throw new Error('Task not found');
    }
    
    if (task.user_id !== userId) {
      throw new Error('Not authorized to assign this task');
    }
    
    const updatedTask = await this.taskRepository.update(taskId, { assigned_to_id: assigneeId });
    
    return updatedTask;
  }

  async getTaskById(taskId: number): Promise<Task | null> {
    return await this.taskRepository.findById(taskId);
  }

  async deleteTask(taskId: number): Promise<boolean> {
    return await this.taskRepository.delete(taskId);
  }

  async getTaskOwner(taskId: number): Promise<number | null> {
    const task = await this.taskRepository.findById(taskId);
    return task?.user_id || null;
  }

  async getTaskAssignee(taskId: number): Promise<number | null> {
    const task = await this.taskRepository.findById(taskId);
    return task?.assigned_to_id || null;
  }
}

export default new TaskService();