import { app } from './app';
import { config } from './config/';
import { connectMongo } from './config/db';

const PORT = config.port || 4000;

async function main() {
  await connectMongo();
  app.listen(PORT, () => {
    console.log(`NamelessNote API listening on :${PORT}`);
  });
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});