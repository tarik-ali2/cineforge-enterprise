const serverless = require('serverless-http');

let handlerPromise;

function normalizeUrl(req, prefix) {
  if (req.url.startsWith('/api/')) return;
  req.url = `${prefix}${req.url === '/' ? '' : req.url}`;
}

async function getHandler() {
  if (!handlerPromise) {
    handlerPromise = import('../apps/api/dist/app.js')
      .then(({ createApp }) => createApp({ serveStaticMedia: false }))
      .then((app) => serverless(app));
  }
  return handlerPromise;
}

module.exports = function createVercelHandler(prefix) {
  return async function handler(req, res) {
    normalizeUrl(req, prefix);
    const fn = await getHandler();
    return fn(req, res);
  };
};
