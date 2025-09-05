import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import { asyncErrorHandler } from "../middleware/error";
import { Property } from "../models/Property";
import { fromBase64, toBase64 } from "../utils/base64";
import { sanitizeHtmlSafe, htmlToText, normalizePropName, PROP_NAME_REGEX } from "../utils/text";
import { Exception } from "../config/exeption";
import { HttpResponse } from "../config/http-response";
import { mapResults } from "../utils/mapper";
import { HTTP_STATUS } from "../config/constants";

// GET /api/groups/:groupId/properties
export const listPropertiesByGroup = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { groupId } = req.params;
      if (!Types.ObjectId.isValid(groupId)) {
        return next(new Exception("groupId inválido", HTTP_STATUS.BAD_REQUEST, null));
      }

      const docs = await Property.find({ groupId })
        .sort({ propertyNameLower: 1 })
        .lean();

      const items = docs.map((d) => {
        const html = fromBase64(d.propertyValueBase64);
        const safeHtml = sanitizeHtmlSafe(html);
        const text = htmlToText(html);
        return {
          propertyName: d.propertyNameOriginal,
          valueHtml: safeHtml,
          valueText: text,
        };
      });

      const result = await mapResults({ items });
      res.status(HTTP_STATUS.OK).json(
        new HttpResponse({
          data: result,
          success: true,
          message: "Variables del grupo",
        })
      );
    } catch (error: any) {
      return next(
        new Exception(
          "Error al listar variables",
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
          error
        )
      );
    }
  }
);

// POST /api/groups/:groupId/properties   { propertyName, valueHtml }
export const upsertProperty = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { groupId } = req.params;
      const { propertyName, valueHtml } = req.body || {};

      if (!Types.ObjectId.isValid(groupId)) {
        return next(new Exception("groupId inválido", HTTP_STATUS.BAD_REQUEST, null));
      }
      if (!PROP_NAME_REGEX.test(propertyName || "")) {
        return next(
          new Exception(
            "propertyName inválido (A-Za-z0-9, 1..25)",
            HTTP_STATUS.BAD_REQUEST,
            null
          )
        );
      }
      if (typeof valueHtml !== "string" || valueHtml.length > 2000) {
        return next(
          new Exception(
            "valueHtml inválido o excede 2000",
            HTTP_STATUS.BAD_REQUEST,
            null
          )
        );
      }

      const lower = normalizePropName(propertyName);
      const b64 = toBase64(valueHtml);

      await Property.findOneAndUpdate(
        { groupId, propertyNameLower: lower },
        {
          $set: {
            propertyNameOriginal: propertyName,
            propertyNameLower: lower,
            propertyValueBase64: b64,
          },
        },
        { upsert: true, new: true }
      ).lean();

      const result = await mapResults({ ok: true });
      res.status(HTTP_STATUS.OK).json(
        new HttpResponse({
          data: result,
          success: true,
          message: "Variable creada/actualizada",
        })
      );
    } catch (error: any) {
      return next(
        new Exception(
          "Error al crear/actualizar variable",
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
          error
        )
      );
    }
  }
);

// DELETE /api/groups/:groupId/properties/:propertyName
export const deleteProperty = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { groupId, propertyName } = req.params;
      if (!Types.ObjectId.isValid(groupId)) {
        return next(new Exception("groupId inválido", HTTP_STATUS.BAD_REQUEST, null));
      }
      const lower = normalizePropName(String(propertyName || ""));
      await Property.deleteOne({ groupId, propertyNameLower: lower });

      const result = await mapResults({ ok: true });
      res.status(HTTP_STATUS.OK).json(
        new HttpResponse({
          data: result,
          success: true,
          message: "Variable eliminada",
        })
      );
    } catch (error: any) {
      return next(
        new Exception(
          "Error al eliminar variable",
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
          error
        )
      );
    }
  }
);
