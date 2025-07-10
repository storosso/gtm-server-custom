// server.js
const http = require('http');
const url = require('url');

const PORT = Number(process.env.PORT) || 8080;

const server = http.createServer((req, res) => {
  const { pathname } = url.parse(req.url, true);

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // Health check
  if (pathname === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    return res.end('OK');
  }

  // GTM Server Tag endpoint
  if (pathname === '/collect' || pathname === '/g/collect') {
    let body = '';
    req.on('data', chunk => { body += chunk });
    req.on('end', () => {
      if (!body || body.trim().length === 0) {
        console.error('❌ Empty request body');
        res.writeHead(400);
        return res.end('Bad Request: Empty body');
      }

      let json;
      try {
        json = JSON.parse(body);
      } catch (err) {
        console.error('❌ Failed to parse JSON:', err.message);
        res.writeHead(400);
        return res.end('Bad Request: Invalid JSON');
      }

      const fbPayload = {
        data: [{
          event_name: json.event_name || 'page_view',
          event_time: Math.floor(Date.now() / 1000),
          event_source_url: json.event_source_url || '',
          action_source: 'website',
          user_data: {
            client_ip_address: req.socket.remoteAddress,
            client_user_agent: req.headers['user-agent'],
            client_user_agent: req.headers['user-agent']
          },
          custom_data: {
            currency: json.currency || 'EUR',
            value: parseFloat(json.value) || 0,
            contents: json.contents || []
          },
          event_id: json.event_id || undefined
        }]
      };

      const postData = JSON.stringify(fbPayload);
      const fbPath = `/v17.0/${process.env.FB_PIXEL_ID}/events?access_token=${process.env.FB_ACCESS_TOKEN}`;

      const fbReq = require('https').request({
        hostname: 'graph.facebook.com',
        path: fbPath,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      }, fbRes => {
        let response = '';
        fbRes.on('data', chunk => response += chunk);
        fbRes.on('end', () => {
          console.log('✅ FB CAPI response:', fbRes.statusCode, response);
        });
      });

      fbReq.on('error', err => console.error('❌ FB CAPI error:', err));
      fbReq.write(postData);
      fbReq.end();

      res.writeHead(204);
      return res.end();
    });

    return;
  }

  // Default 404
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
// server.js
const http = require('http');
const url = require('url');

const PORT = Number(process.env.PORT) || 8080;

const server = http.createServer((req, res) => {
  const { pathname } = url.parse(req.url, true);

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // Health check
  if (pathname === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    return res.end('OK');
  }

  // GTM Server Tag endpoint
  if (pathname === '/collect' || pathname === '/g/collect') {
    let body = '';
    req.on('data', chunk => { body += chunk });
    req.on('end', () => {
      if (!body || body.trim().length === 0) {
        console.error('❌ Empty request body');
        res.writeHead(400);
        return res.end('Bad Request: Empty body');
      }

      let json;
      try {
        json = JSON.parse(body);
      } catch (err) {
        console.error('❌ Failed to parse JSON:', err.message);
        res.writeHead(400);
        return res.end('Bad Request: Invalid JSON');
      }

      const fbPayload = {
        data: [{
          event_name: json.event_name || 'page_view',
          event_time: Math.floor(Date.now() / 1000),
          event_source_url: json.event_source_url || '',
          action_source: 'website',
          user_data: {
            client_ip_address: req.socket.remoteAddress,
            client_user_agent: req.headers['user-agent'],
            client_user_agent: req.headers['user-agent']
          },
          custom_data: {
            currency: json.currency || 'EUR',
            value: parseFloat(json.value) || 0,
            contents: json.contents || []
          },
          event_id: json.event_id || undefined
        }]
      };

      const postData = JSON.stringify(fbPayload);
      const fbPath = `/v17.0/${process.env.FB_PIXEL_ID}/events?access_token=${process.env.FB_ACCESS_TOKEN}`;

      const fbReq = require('https').request({
        hostname: 'graph.facebook.com',
        path: fbPath,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      }, fbRes => {
        let response = '';
        fbRes.on('data', chunk => response += chunk);
        fbRes.on('end', () => {
          console.log('✅ FB CAPI response:', fbRes.statusCode, response);
        });
      });

      fbReq.on('error', err => console.error('❌ FB CAPI error:', err));
      fbReq.write(postData);
      fbReq.end();

      res.writeHead(204);
      return res.end();
    });

    return;
  }

  // Default 404
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
