import { env } from './config/env.js';
import { createApp } from './app.js';

async function bootstrap() {
  const app = await createApp();
  app.listen(env.PORT, () => {
    console.log(`CineForge API running on http://localhost:${env.PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error('API bootstrap failed', error);
  process.exit(1);
});
