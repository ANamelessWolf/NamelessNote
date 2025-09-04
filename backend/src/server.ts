import { app } from './app';
import { config } from './config/';

const PORT = config.port || 4000;
app.listen(PORT, () => {
  console.log(`NamelessNote API listening on :${config.port}`);
  console.log(`Swagger UI: http://localhost:${config.port}/docs`);
});
