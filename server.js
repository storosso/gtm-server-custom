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
    // extract GTM payload from querystring
    const params    = new URL(req.url, `http://_`).searchParams;
    const eventName = params.get('en') || 'page_view';

    // build Facebook CAPI payload
    const fbPayload = {
      data: [{
        event_name:       eventName,
        event_time:       Math.floor(Date.now() / 1000),
        event_source_url: params.get('dl') || params.get('dp'),
        action_source:    'website',
        user_data: {
          client_ip_address: req.socket.remoteAddress,
          client_user_agent: req.headers['user-agent']
        },
        custom_data: {
          currency: params.get('cu'),
          value:    parseFloat(params.get('ev')) || undefined
        },
        event_id: params.get('gtm.eventId') || undefined
      }]
    };

    // send to FB Conversion API
    const postData = JSON.stringify(fbPayload);
    const fbHost   = 'graph.facebook.com';
    const fbPath   = `/v17.0/${process.env.FB_PIXEL_ID}/events?access_token=${process.env.FB_ACCESS_TOKEN}`;

    const fbReq = require('https').request(
      { hostname: fbHost, path: fbPath, method: 'POST', headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      },
      fbRes => {
        let body = '';
        fbRes.on('data', chunk => body += chunk);
        fbRes.on('end', () => {
          console.log('FB CAPI response:', fbRes.statusCode, body);
        });
      }
    );

    fbReq.on('error', err => console.error('FB CAPI error:', err));
    fbReq.write(postData);
    fbReq.end();

    // immediately acknowledge GTM
    res.writeHead(204);
    return res.end();
  }

  // — everything else —
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
