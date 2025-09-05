import { Router } from 'express';
import health from './health';
import groups from "./groups";
import properties from "./properties";

const router = Router();
router.use('/health', health);
router.use("/api/groups", groups);
router.use("/api/groups/:groupId/properties", properties);

export default router;
