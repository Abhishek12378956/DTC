import { Router } from 'express';
import reportController from '../controllers/report.controller';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/individual', (req, res) => reportController.getIndividual(req, res));
router.get('/assigner', (req, res) => reportController.getAssigner(req, res));
router.get('/dmt', (req, res) => reportController.getDMT(req, res));
router.get('/export', (req, res) => reportController.export(req, res));

export default router;

