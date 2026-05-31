import serverless from 'serverless-http';
import { createApp } from '../apps/api/dist/app.js';

let handlerPromise;

async function getHandler() {
  if (!handlerPromise) {
    handlerPromise = createApp({ serveStaticMedia: false }).then((app) => serverless(app));
  }
  return handlerPromise;
}

export default async function handler(req, res) {
  const fn = await getHandler();
  return fn(req, res);
}
