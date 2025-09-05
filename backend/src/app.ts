import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/';
import routes from './routes/';
import swaggerRouter from './swagger/';
import { notFound, errorHandler } from './middleware/error';

const app = express();

app.use(helmet()); // global, con CSP por defecto

const swaggerCsp = helmet.contentSecurityPolicy({
  useDefaults: true,
  directives: {
    ...helmet.contentSecurityPolicy.getDefaultDirectives(),
    "script-src": ["'self'", "'unsafe-inline'", "https:"],
    "style-src": ["'self'", "'unsafe-inline'", "https:"],
    "img-src": ["'self'", "data:", "https:"],
  },
});

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

// Rutas públicas
app.use('/', routes);

// Swagger UI
app.use("/docs", swaggerCsp, swaggerRouter);

// 404 + error handler
app.use(notFound);
app.use(errorHandler);

export { app };
