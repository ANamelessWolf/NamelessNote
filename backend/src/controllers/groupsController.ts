import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import { asyncErrorHandler } from "../middleware/error";
import { Group } from "../models/Group";
import { Property } from "../models/Property";
import { HTTP_STATUS } from "../config/constants";
import { Exception } from "../config/exeption";
import { HttpResponse } from "../config/http-response";
import { getAuthenticatedUser } from "../middleware/auth";
import { mapResults } from "../utils/mapper";

// GET /api/groups?search=
export const searchGroups = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = getAuthenticatedUser(req);
      const search = String(req.query.search || "");
      const query = search
        ? { ownerId: user.sub, groupName: { $regex: search, $options: "i" } }
        : { ownerId: user.sub };
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
      const user = getAuthenticatedUser(req);
      const { groupName } = req.body || {};
      if (!groupName || typeof groupName !== "string" || groupName.length > 30) {
        return next(
          new Exception("groupName inválido (1..30)", HTTP_STATUS.BAD_REQUEST, null)
        );
      }

      const doc = await Group.create({
        groupName,
        ownerId: user.sub,
        ownerEmail: user.email,
        authProvider: "google",
      });
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
      const user = getAuthenticatedUser(req);
      const { groupId } = req.params;
      if (!Types.ObjectId.isValid(groupId)) {
        return next(new Exception("groupId invÃ¡lido", HTTP_STATUS.BAD_REQUEST, null));
      }
      await Property.deleteMany({ groupId, ownerId: user.sub });
      const deleted = await Group.findOneAndDelete({ _id: groupId, ownerId: user.sub });
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
