// src/middleware/error.ts
import { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import {
  HTTP_STATUS,
} from "../config/constants";

import { HttpErrorResponse } from "../config/http-response";
import { Exception } from "../config/exeption";

dotenv.config();

/**
 * Express error-handling middleware.
 * - Respeta DEBUG=true para incluir stacktrace.
 * - Usa HttpErrorResponse y Exception actuales.
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  // Determina status code
  const errorStatus: number =
    (err instanceof Exception && err.statusCode) ||
    err?.statusCode ||
    (res.statusCode >= 400 ? res.statusCode : HTTP_STATUS.INTERNAL_SERVER_ERROR);

  // Mensaje visible
  const errorMessage: string = err?.message || "Something went wrong";

  // Respuesta
  if (process.env.DEBUG === "true") {
    const stack = (err?.stack ? String(err.stack) : "")
      .split("\n")
      .map((line) => line.trim());
    return res.status(errorStatus).json(
      new HttpErrorResponse({
        success: false,
        data: stack, // stack en data cuando DEBUG=true
        errorCode: errorStatus,
        message: errorMessage,
        error: err?.detail || err?.toString?.() || "Unknown error",
      })
    );
  }

  return res.status(errorStatus).json(
    new HttpErrorResponse({
      success: false,
      data: [], // sin detalles en no-DEBUG
      errorCode: errorStatus,
      message: errorMessage,
      error: undefined,
    })
  );
}

/**
 * 404 handler (opcional, si no lo tienes ya montado)
 */
export function notFound(_req: Request, res: Response) {
  return res.status(HTTP_STATUS.NOT_FOUND).json(
    new HttpErrorResponse({
      success: false,
      data: [],
      errorCode: HTTP_STATUS.NOT_FOUND,
      message: "Not found",
      error: "Route not found",
    })
  );
}

/**
 * Envuelve controladores async y delega errores al errorHandler.
 * Compatible con tu firma requerida.
 */
export const asyncErrorHandler =
  (func: (req: Request, res: Response, next: NextFunction) => Promise<any> | any) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(func(req, res, next)).catch(next);
  };