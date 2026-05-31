const serverless = require('serverless-http');

let handlerPromise;

async function getHandler() {
  if (!handlerPromise) {
    handlerPromise = import('../apps/api/dist/app.js')
      .then(({ createApp }) => createApp({ serveStaticMedia: false }))
      .then((app) => serverless(app));
  }
  return handlerPromise;
}

module.exports = async function handler(req, res) {
  const fn = await getHandler();
  return fn(req, res);
};
