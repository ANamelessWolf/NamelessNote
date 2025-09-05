import { NextFunction, Request, Response } from "express";
import { asyncErrorHandler } from "../middleware/error";
import { Group } from "../models/Group";
import { Property } from "../models/Property";
import { HTTP_STATUS } from "../config/constants";
import { Exception } from "../config/exeption";
import { HttpResponse } from "../config/http-response";
import { mapResults } from "../utils/mapper";

// GET /api/groups?search=
export const searchGroups = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const search = String(req.query.search || "");
      const query = search
        ? { groupName: { $regex: search, $options: "i" } }
        : {};
      const items = await Group.find(query).sort({ updatedAt: -1 }).lean();

      const result = await mapResults({ items });
      res.status(HTTP_STATUS.OK).json(
        new HttpResponse({
          data: result,
          success: true,
          message: "Groups found",
        })
      );
    } catch (error: any) {
      return next(
        new Exception("Error searching groups", HTTP_STATUS.INTERNAL_SERVER_ERROR, error)
      );
    }
  }
);

// POST /api/groups  { groupName }
export const createGroup = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { groupName } = req.body || {};
      if (!groupName || typeof groupName !== "string" || groupName.length > 30) {
        return next(
          new Exception("groupName inválido (1..30)", HTTP_STATUS.BAD_REQUEST, null)
        );
      }

      const doc = await Group.create({ groupName });
      const result = await mapResults(doc);
      res.status(HTTP_STATUS.CREATED).json(
        new HttpResponse({
          data: result,
          success: true,
          message: "Grupo creado",
        })
      );
    } catch (error: any) {
      return next(
        new Exception("Error al crear grupo", HTTP_STATUS.INTERNAL_SERVER_ERROR, error)
      );
    }
  }
);

// DELETE /api/groups/:groupId
export const deleteGroup = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { groupId } = req.params;
      await Property.deleteMany({ groupId });
      const deleted = await Group.findByIdAndDelete(groupId);
      if (!deleted) {
        return next(
          new Exception("Grupo no encontrado", HTTP_STATUS.NOT_FOUND, null)
        );
      }

      const result = await mapResults({ ok: true });
      res.status(HTTP_STATUS.OK).json(
        new HttpResponse({
          data: result,
          success: true,
          message: "Grupo eliminado",
        })
      );
    } catch (error: any) {
      return next(
        new Exception("Error al eliminar grupo", HTTP_STATUS.INTERNAL_SERVER_ERROR, error)
      );
    }
  }
);
