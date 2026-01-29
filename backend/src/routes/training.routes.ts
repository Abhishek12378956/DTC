import { Router } from 'express';
import trainingController from '../controllers/training.controller';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', (req, res) => trainingController.getAll(req, res));
router.get('/:id', (req, res) => trainingController.getById(req, res));
router.post('/', (req, res) => trainingController.create(req, res));
router.put('/:id', (req, res) => trainingController.update(req, res));
router.delete('/:id', (req, res) => trainingController.delete(req, res));

export default router;

