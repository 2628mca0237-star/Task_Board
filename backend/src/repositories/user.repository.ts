import pool from '../config/database';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  created_at?: Date;
}

class UserRepository {
  // Find user by email
  async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  // Find user by ID (NEW METHOD)
  async findById(id: number): Promise<User | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  // Create a new user
  async create(name: string, email: string, password: string): Promise<User> {
    const result = await pool.query(
      `INSERT INTO users (name, email, password, created_at) 
       VALUES ($1, $2, $3, NOW()) 
       RETURNING *`,
      [name, email, password]
    );
    return result.rows[0];
  }

  // Update user
  async update(id: number, data: Partial<Omit<User, 'id' | 'password'>>): Promise<User> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramCount}`);
      values.push(data.name);
      paramCount++;
    }

    if (data.email !== undefined) {
      updates.push(`email = $${paramCount}`);
      values.push(data.email);
      paramCount++;
    }

    values.push(id);

    const query = `
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Get all users (for task assignment dropdown)
  async findAll(): Promise<User[]> {
    const result = await pool.query(
      'SELECT id, name, email, created_at FROM users ORDER BY name ASC'
    );
    return result.rows;
  }

  // Compare password (optional, can also be done in controller)
  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return false; // Placeholder
  }
}

export default new UserRepository();