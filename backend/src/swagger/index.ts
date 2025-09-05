import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
import SwaggerParser from "@apidevtools/swagger-parser";

const router = Router();

// Ruta absoluta del openapi raíz (con $ref a ./paths, ./schemas, etc.)
const openapiPath = path.join(__dirname, "openapi.yaml");

// Servimos el YAML crudo (útil para inspección manual o pipelines)
router.get("/openapi.yaml", (_req, res) => res.sendFile(openapiPath));

// También servimos la carpeta para que puedas abrir /docs/paths/*.yaml si quieres
router.use("/", (req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

// Construye UNA versión bundleda (resuelve $ref a archivos) y pasa ese objeto a la UI
let docPromise: Promise<any> | null = null;

function getBundledDoc() {
  if (!docPromise) {
    docPromise = (async () => {
      // Carga base (para validar errores de YAML temprano)
      YAML.load(openapiPath);

      // Bundle (conserva $ref donde puede, pero hace fetch de archivos; también puedes usar .dereference)
      const bundled = await SwaggerParser.bundle(openapiPath);
      return bundled;
    })().catch((e) => {
      // Reset si falló, para que el próximo request reintente
      docPromise = null;
      throw e;
    });
  }
  return docPromise;
}

router.use("/", swaggerUi.serve, async (req:any, res:any, next:any) => {
  try {
    const bundled = await getBundledDoc();
    return (swaggerUi.setup(bundled, { explorer: true }) as any)(req, res, next);
  } catch (e) {
    next(e);
  }
});

export default router;
