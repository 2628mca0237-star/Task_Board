import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

export const setupSocketIO = (io: Server) => {
  // Authentication middleware for sockets
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_KEY!) as any;
      socket.data.user = decoded;
      next();
    } catch (error) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log('User connected:', socket.data.user?.id);
    
    // Join user-specific room for notifications
    if (socket.data.user?.id) {
      socket.join(`user:${socket.data.user.id}`);
    }
    
    // Join task-specific room when requested
    socket.on('join-user-room', (userId: string) => {
      socket.join(`user:${userId}`);
      console.log(`User joined personal room: user:${userId}`);
    });
    
    socket.on('leave-task', (taskId: string) => {
      socket.leave(`task:${taskId}`);
    });
    
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.data.user?.id);
    });
  });
};

// Helper functions to emit events
export const emitTaskUpdate = (io: Server, taskId: number, updateType: string, data: any) => {
  io.to(`task:${taskId}`).emit('task-updated', {
    type: updateType,
    taskId,
    data,
    timestamp: new Date().toISOString()
  });
};

export const emitAssignmentNotification = (io: Server, assigneeId: number, task: any) => {
  io.to(`user:${assigneeId}`).emit('task-assigned', {
    type: 'task-assigned',
    task,
    timestamp: new Date().toISOString(),
    message: `A new task "${task.title}" has been assigned to you`
  });
};

export const emitStatusChange = (io: Server, taskId: number, oldStatus: string, newStatus: string, task: any) => {
  io.to(`task:${taskId}`).emit('status-changed', {
    type: 'status-changed',
    taskId,
    oldStatus,
    newStatus,
    task,
    timestamp: new Date().toISOString()
  });
};