import { Router } from "express";
import { createGroup, deleteGroup, searchGroups } from "../controllers/groupsController";

const router = Router();

router.get("/", searchGroups);
router.post("/", createGroup);
router.delete("/:groupId", deleteGroup);

export default router;
