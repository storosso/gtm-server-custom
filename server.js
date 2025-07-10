// server.js
const http = require('http');
const url  = require('url');

const PORT = Number(process.env.PORT) || 8080;

const server = http.createServer((req, res) => {
  const { pathname } = url.parse(req.url, true);

  // — CORS —
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // — health check —
  if (pathname === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    return res.end('OK');
  }

  // — GTM collects — support both endpoints
  // GTM client may POST to /g/collect OR /collect
  if (pathname === '/g/collect' || pathname === '/collect') {
    res.writeHead(204); // no content
    return res.end();
  }

  // — everything else —
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
