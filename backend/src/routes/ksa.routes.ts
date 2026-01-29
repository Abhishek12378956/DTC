import { Router } from 'express';
import ksaController from '../controllers/ksa.controller';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', (req, res) => ksaController.getAll(req, res));
router.post('/', (req, res) => ksaController.create(req, res));
router.get('/:positionId/position', (req, res) => ksaController.getByPosition(req, res));
router.post('/position-ksa', (req, res) => ksaController.createPositionKSA(req, res));

export default router;

