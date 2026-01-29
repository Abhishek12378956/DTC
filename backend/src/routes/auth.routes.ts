import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/login', (req, res) => authController.login(req, res));
router.get('/me', authenticate, (req, res) => authController.getMe(req, res));

export default router;

