const serverless = require('serverless-http');

let handlerPromise;

function normalizeUrl(req, prefix) {
  if (req.url.startsWith('/api/')) return;
  const rawPath = req.query?.path ?? req.query?.orderCode;
  const pathValue = Array.isArray(rawPath) ? rawPath.join('/') : rawPath;
  const params = new URLSearchParams(req.url.includes('?') ? req.url.split('?')[1] : '');
  params.delete('path');
  params.delete('orderCode');
  const query = params.toString();
  const suffix = pathValue ? `/${pathValue}` : (req.url === '/' ? '' : req.url);
  req.url = `${prefix}${suffix}${query ? `?${query}` : ''}`;
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
