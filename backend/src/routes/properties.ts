import { Router } from "express";
import { deleteProperty, listPropertiesByGroup, upsertProperty } from "../controllers/propertiesController";

const router = Router({ mergeParams: true });

router.get("/", listPropertiesByGroup);                 // Listar variables del grupo
router.post("/", upsertProperty);                       // Crear/actualizar variable
router.delete("/:propertyName", deleteProperty);        // Eliminar variable por nombre

export default router;
