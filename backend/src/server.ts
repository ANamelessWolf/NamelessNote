import fs from 'fs';
import https from 'https';
import path from 'path';
import { app } from './app';
import { config } from './config/';
import { connectMongo } from './config/db';

const PORT = config.port || 4000;

function resolveFromBackend(relativeOrAbsolutePath: string) {
  if (!relativeOrAbsolutePath) return '';
  return path.isAbsolute(relativeOrAbsolutePath)
    ? relativeOrAbsolutePath
    : path.resolve(process.cwd(), relativeOrAbsolutePath);
}

async function main() {
  await connectMongo();

  if (config.httpsEnabled) {
    const keyPath = resolveFromBackend(config.httpsKeyFile);
    const certPath = resolveFromBackend(config.httpsCertFile);

    if (keyPath && certPath && fs.existsSync(keyPath) && fs.existsSync(certPath)) {
      https
        .createServer(
          {
            key: fs.readFileSync(keyPath),
            cert: fs.readFileSync(certPath),
          },
          app
        )
        .listen(PORT, () => {
          console.log(`NamelessNote API listening on https://localhost:${PORT}`);
        });
      return;
    }

    console.warn('HTTPS_ENABLED=true but the certificate files were not found. Falling back to HTTP.');
  }

  app.listen(PORT, () => {
    console.log(`NamelessNote API listening on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
