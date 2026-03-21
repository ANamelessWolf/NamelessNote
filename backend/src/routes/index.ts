import { Router } from 'express';
import health from './health';
import auth from './auth';
import groups from "./groups";
import properties from "./properties";
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use('/health', health);
router.use('/auth', auth);
router.use("/api/groups", requireAuth, groups);
router.use("/api/groups/:groupId/properties", requireAuth, properties);

export default router;
