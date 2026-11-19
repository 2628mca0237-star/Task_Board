import { Request, Response } from 'express';
import taskService from '../services/task.service';
import { emitTaskUpdate, emitAssignmentNotification, emitStatusChange } from '../sockets/task.socket';

// Temporarily comment out DTO imports
// import { CreateTaskDto, UpdateTaskDto, FilterTasksDto } from '../dtos/task.dto';

export const getTasks = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // If no filters, return dashboard data
    if (Object.keys(req.query).length === 0) {
      const dashboardData = await taskService.getDashboardData(userId);
      return res.json(dashboardData);
    }
    
    // Apply filters if provided (temporarily without validation)
    const filters = req.query;
    const tasks = await taskService.getTasksWithFilters(userId, filters);
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const taskData = req.body;
    
    const task = await taskService.createTask(userId, taskData);
    
    // Get socket.io instance from app
    const io = req.app.get('io');
    
    // Emit socket event for new task creation
    if (io) {
      emitTaskUpdate(io, task.id, 'create', task);
      
      // If task is assigned to someone, send notification
      if (task.assigned_to_id && task.assigned_to_id !== userId) {
        emitAssignmentNotification(io, task.assigned_to_id, task);
      }
    }
    
    res.status(201).json({
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const taskId = parseInt(req.params.id);
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const updateData = req.body;
    
    // Get current task before update for comparison
    const currentTask = await taskService.getTaskById(taskId);
    
    const task = await taskService.updateTask(taskId, userId, updateData);
    
    // Get socket.io instance from app
    const io = req.app.get('io');
    
    // Emit socket event for task update
    if (io) {
      emitTaskUpdate(io, taskId, 'update', task);
      
      // If status changed, emit specific status change event
      if (currentTask && updateData.status && currentTask.status !== updateData.status) {
        emitStatusChange(io, taskId, currentTask.status, updateData.status, task);
      }
      
      // If assigned_to changed, send notification to new assignee
      if (currentTask && updateData.assigned_to_id && 
          currentTask.assigned_to_id !== updateData.assigned_to_id &&
          updateData.assigned_to_id !== userId) {
        emitAssignmentNotification(io, updateData.assigned_to_id, task);
      }
    }
    
    res.json({
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Task not found') {
        res.status(404).json({ message: 'Task not found' });
      } else if (error.message === 'Not authorized to update this task') {
        res.status(403).json({ message: 'Not authorized' });
      } else {
        res.status(500).json({ message: 'Server error', error: error.message });
      }
    } else {
      res.status(500).json({ message: 'Server error', error: 'Unknown error' });
    }
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const taskId = parseInt(req.params.id);
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Check if task exists and user owns it
    const task = await taskService.getTaskById(taskId);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    if (task.user_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this task' });
    }
    
    await taskService.deleteTask(taskId);
    
    // Get socket.io instance from app
    const io = req.app.get('io');
    
    // Emit socket event for task deletion
    if (io) {
      emitTaskUpdate(io, taskId, 'delete', { 
        id: taskId, 
        deleted: true,
        deletedAt: new Date().toISOString() 
      });
    }
    
    res.status(200).json({ 
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const assignTask = async (req: Request, res: Response) => {
  try {
    const taskId = parseInt(req.params.id);
    const { assigned_to_id } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (!assigned_to_id) {
      return res.status(400).json({ message: 'Assignee ID is required' });
    }
    
    const task = await taskService.assignTask(taskId, assigned_to_id, userId);
    
    // Get socket.io instance from app
    const io = req.app.get('io');
    
    // Emit socket events for assignment
    if (io) {
      // Emit to task room about the assignment
      emitTaskUpdate(io, taskId, 'assign', task);
      
      // Send notification to the assignee
      if (assigned_to_id !== userId) {
        emitAssignmentNotification(io, assigned_to_id, task);
      }
    }
    
    res.json({
      message: 'Task assigned successfully',
      task
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Task not found') {
        res.status(404).json({ message: 'Task not found' });
      } else if (error.message === 'Not authorized to assign this task') {
        res.status(403).json({ message: 'Not authorized' });
      } else {
        res.status(500).json({ message: 'Server error', error: error.message });
      }
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
};