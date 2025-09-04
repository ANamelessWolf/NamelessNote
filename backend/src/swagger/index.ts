import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

const doc = YAML.load(require.resolve('./openapi.yaml'));
const router = Router();

router.use('/', swaggerUi.serve, swaggerUi.setup(doc, { explorer: true }));

export default router;
