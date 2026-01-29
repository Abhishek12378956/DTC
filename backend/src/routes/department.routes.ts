import { Router } from 'express';
import departmentController from '../controllers/department.controller';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Department routes
router.get('/', (req, res) => departmentController.getAll(req, res));
router.get('/:id', (req, res) => departmentController.getById(req, res));
router.post('/', (req, res) => departmentController.create(req, res));
router.put('/:id', (req, res) => departmentController.update(req, res));
router.delete('/:id', (req, res) => departmentController.delete(req, res));

export default router;
