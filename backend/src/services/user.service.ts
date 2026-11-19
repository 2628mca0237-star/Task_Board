import userRepository from '../repositories/user.repository';
import type { User } from '../repositories/user.repository';
import bcrypt from 'bcrypt';
import { generateToken } from '../middleware/auth.middleware';

export class UserService {
  constructor(private repository: typeof userRepository) {}

  async register(name: string, email: string, password: string) {
    const existingUser = await this.repository.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await this.repository.create(name, email, hashedPassword);
    return { message: 'User created successfully.', user };
  }

  async login(email: string, password: string) {
    const user = await this.repository.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    const isMatch = await this.repository.comparePassword(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const payload = { id: user.id, email: user.email };
    const token = generateToken(payload);
    return { message: 'Login successful', token, user: { id: user.id, email: user.email, name: user.name } };
  }

  async getProfile(email: string) {
    const user = await this.repository.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }
    return { name: user.name, email: user.email };
  }

}

export default new UserService(userRepository);