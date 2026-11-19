import pool from '../config/database';
import { Task, CreateTaskInput, UpdateTaskInput, TaskStatus, TaskPriority } from '../types';

export class TaskRepository {
  async findAll(userId?: number): Promise<Task[]> {
    let query = 'SELECT * FROM tasks';
    const params: any[] = [];
    
    if (userId) {
      query += ' WHERE user_id = $1';
      params.push(userId);
    }
    
    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    return result.rows;
  }

  async findById(id: number): Promise<Task | null> {
    const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async create(taskData: CreateTaskInput & { user_id: number }): Promise<Task> {
    const { title, description, due_date, status, priority, user_id, assigned_to_id } = taskData;
    
    const query = `
      INSERT INTO tasks (
        title, description, due_date, status, priority, 
        user_id, assigned_to_id, created_at, updated_at
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING *
    `;
    
    const values = [
      title,
      description || null,
      due_date || null,
      status || TaskStatus.TODO,
      priority || TaskPriority.MEDIUM,
      user_id,
      assigned_to_id || null
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async update(id: number, taskData: UpdateTaskInput): Promise<Task> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;
    
    // Dynamic query building
    if (taskData.title !== undefined) {
      updates.push(`title = $${paramCount}`);
      values.push(taskData.title);
      paramCount++;
    }
    
    if (taskData.description !== undefined) {
      updates.push(`description = $${paramCount}`);
      values.push(taskData.description);
      paramCount++;
    }
    
    if (taskData.due_date !== undefined) {
      updates.push(`due_date = $${paramCount}`);
      values.push(taskData.due_date);
      paramCount++;
    }
    
    if (taskData.status !== undefined) {
      updates.push(`status = $${paramCount}`);
      values.push(taskData.status);
      paramCount++;
    }
    
    if (taskData.priority !== undefined) {
      updates.push(`priority = $${paramCount}`);
      values.push(taskData.priority);
      paramCount++;
    }
    
    if (taskData.assigned_to_id !== undefined) {
      updates.push(`assigned_to_id = $${paramCount}`);
      values.push(taskData.assigned_to_id);
      paramCount++;
    }
    
    updates.push(`updated_at = NOW()`);
    
    values.push(id);
    
    const query = `
      UPDATE tasks 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  async findByUser(userId: number): Promise<Task[]> {
    const result = await pool.query(
      'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  }

  async findByAssignee(assigneeId: number): Promise<Task[]> {
    const result = await pool.query(
      'SELECT * FROM tasks WHERE assigned_to_id = $1 ORDER BY created_at DESC',
      [assigneeId]
    );
    return result.rows;
  }

  async findOverdue(userId?: number): Promise<Task[]> {
    let query = `
      SELECT * FROM tasks 
      WHERE due_date < NOW() 
      AND status NOT IN ($1, $2)
    `;
    
    const params: any[] = [TaskStatus.COMPLETED, TaskStatus.REVIEW];
    
    if (userId) {
      query += ' AND (user_id = $3 OR assigned_to_id = $3)';
      params.push(userId);
    }
    
    query += ' ORDER BY due_date ASC';
    
    const result = await pool.query(query, params);
    return result.rows;
  }

  // New method for executing custom queries
  async executeQuery(query: string, params: any[] = []): Promise<any[]> {
    try {
      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error executing query:', error);
      throw error;
    }
  }

  // Get all users for assignment dropdown
  async getAllUsers(): Promise<{id: number, name: string, email: string}[]> {
    const result = await pool.query('SELECT id, name, email FROM users ORDER BY name ASC');
    return result.rows;
  }

  // Get tasks by status
  async findByStatus(status: TaskStatus, userId?: number): Promise<Task[]> {
    let query = 'SELECT * FROM tasks WHERE status = $1';
    const params: any[] = [status];
    
    if (userId) {
      query += ' AND (user_id = $2 OR assigned_to_id = $2)';
      params.push(userId);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    return result.rows;
  }

  // Get tasks by priority
  async findByPriority(priority: TaskPriority, userId?: number): Promise<Task[]> {
    let query = 'SELECT * FROM tasks WHERE priority = $1';
    const params: any[] = [priority];
    
    if (userId) {
      query += ' AND (user_id = $2 OR assigned_to_id = $2)';
      params.push(userId);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    return result.rows;
  }
}

export default new TaskRepository();