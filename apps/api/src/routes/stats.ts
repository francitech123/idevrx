import { Router } from 'express';
import * as ctrl from '../controllers/statsController.js';

const router = Router();

router.get('/', ctrl.getPublicStats);

export default router;
