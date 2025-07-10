// server.js
const http = require('http');
const url  = require('url');

const PORT = Number(process.env.PORT) || 8080;

const server = http.createServer((req, res) => {
  const { pathname } = url.parse(req.url, true);

  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  if (pathname === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    return res.end('OK');
  }

  if (pathname === '/g/collect' || pathname === '/collect') {
    let body = '';

    req.on('data', chunk => { body += chunk });
    req.on('end', () => {
      try {
        const json = JSON.parse(body);
        const data = json || {};
        const eventName = data.event_name || new URL(req.url, 'http://_').searchParams.get('en') || 'page_view';

        const fbPayload = {
          data: [{
            event_name:       eventName,
            event_time:       Math.floor(Date.now() / 1000),
            event_source_url: data.event_source_url || '',
            action_source:    'website',
            user_data: {
              client_ip_address: req.socket.remoteAddress,
              client_user_agent: req.headers['user-agent']
            },
            custom_data: {
              value:    data.value || undefined,
              currency: data.currency || undefined,
              contents: data.contents || undefined
            },
            event_id: data.event_id || undefined
          }]
        };

        console.log('👉 Sending to FB:', JSON.stringify(fbPayload, null, 2));

        const postData = JSON.stringify(fbPayload);
        const fbHost   = 'graph.facebook.com';
        const fbPath   = `/v17.0/${process.env.FB_PIXEL_ID}/events?access_token=${process.env.FB_ACCESS_TOKEN}`;

        const fbReq = require('https').request(
          {
            hostname: fbHost,
            path: fbPath,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(postData)
            }
          },
          fbRes => {
            let fbBody = '';
            fbRes.on('data', chunk => fbBody += chunk);
            fbRes.on('end', () => {
              console.log('✅ FB CAPI response:', fbRes.statusCode, fbBody);
            });
          }
        );

        fbReq.on('error', err => console.error('❌ FB CAPI error:', err));
        fbReq.write(postData);
        fbReq.end();

        res.writeHead(204);
        res.end();
      } catch (err) {
        console.error('❌ Failed to parse request body:', err);
        res.writeHead(400);
        res.end('Bad Request');
      }
    });

    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});
