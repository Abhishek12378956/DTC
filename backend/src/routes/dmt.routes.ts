import { Router } from 'express';
import dmtController from '../controllers/dmt.controller';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/positions', (req, res) => dmtController.getPositions(req, res));
router.post('/positions', (req, res) => dmtController.createPosition(req, res));
router.get('/dmt', (req, res) => dmtController.getDMT(req, res));
router.post('/dmt', (req, res) => dmtController.createDMT(req, res));
router.get('/roles', (req, res) => dmtController.getRoles(req, res));

export default router;

