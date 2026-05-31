const serverless = require('serverless-http');

let handlerPromise;

function restoreOriginalApiPath(req) {
  const rawPath = req.query?.path;
  const pathValue = Array.isArray(rawPath) ? rawPath.join('/') : rawPath;
  if (!pathValue) return;

  const params = new URLSearchParams(req.url.includes('?') ? req.url.split('?')[1] : '');
  params.delete('path');
  const query = params.toString();
  req.url = `/api/${pathValue}${query ? `?${query}` : ''}`;
}

async function getHandler() {
  if (!handlerPromise) {
    handlerPromise = import('../apps/api/dist/app.js')
      .then(({ createApp }) => createApp({ serveStaticMedia: false }))
      .then((app) => serverless(app));
  }
  return handlerPromise;
}

module.exports = async function handler(req, res) {
  if (req.url.startsWith('/api/health') || req.url.startsWith('/api/index?path=health')) {
    res.statusCode = 200;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ ok: true, service: 'cineforge-api', host: 'vercel', time: new Date().toISOString() }));
    return;
  }

  restoreOriginalApiPath(req);
  const fn = await getHandler();
  return fn(req, res);
};
