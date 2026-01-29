import { Router } from 'express';
import assignmentController from '../controllers/assignment.controller';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.put('/:id/status', (req, res) => assignmentController.updateRecipientStatus(req, res));
// router.put('/:id/attendance', (req, res) => assignmentController.updateRecipientAttendance(req, res));
router.put('/:id/self-update', (req, res) => assignmentController.updateOwnStatus(req, res));

export default router;

