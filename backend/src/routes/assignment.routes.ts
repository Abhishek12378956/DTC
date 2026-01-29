import { Router } from 'express';
import assignmentController from '../controllers/assignment.controller';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.post('/', (req, res) => assignmentController.create(req, res));
router.get('/', (req, res) => assignmentController.getAll(req, res));
router.get('/:id/recipients', (req, res) => assignmentController.getRecipients(req, res));

export default router;

