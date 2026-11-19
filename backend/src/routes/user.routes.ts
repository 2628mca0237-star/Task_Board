import express from 'express';
import { registerUser, loginUser, userProfile, getAllUsers } from '../controllers/user.controller';
import { jwtAuthMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', jwtAuthMiddleware, userProfile);
router.get('/', jwtAuthMiddleware, getAllUsers);

export default router;