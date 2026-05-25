import serverless from 'serverless-http';
import { createApp } from '../../apps/api/src/app';

const appPromise = createApp({ serveStaticMedia: false });

export const handler = async (event: unknown, context: unknown) => {
  const app = await appPromise;
  return serverless(app)(event as never, context as never);
};
