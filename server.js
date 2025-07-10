const http = require('http');
const url = require('url');
const https = require('https');

const PORT = Number(process.env.PORT) || 8080;
const FB_PIXEL_ID = process.env.FB_PIXEL_ID;
const FB_ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN;

console.log('FB_PIXEL_ID:', FB_PIXEL_ID);
console.log('FB_ACCESS_TOKEN:', FB_ACCESS_TOKEN?.substring(0, 6), '...');

if (!FB_PIXEL_ID || !FB_ACCESS_TOKEN) {
  console.error('❌ Missing FB_PIXEL_ID or FB_ACCESS_TOKEN in environment variables.');
  process.exit(1);
}

}

const server = http.createServer((req, res) => {
  const { pathname } = url.parse(req.url, true);

  // — CORS —
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // Health check
  if (pathname === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    return res.end('OK');
  }

  // GTM data collection
  if (pathname === '/g/collect' || pathname === '/collect') {
    const params = new URL(req.url, `http://_`).searchParams;
    const eventName = params.get('en') || 'page_view';
    const currency = params.get('cu') || 'EUR';
    const value = parseFloat(params.get('ev')) || undefined;
    const sourceUrl = params.get('dl') || params.get('dp') || 'https://storosso.com';

    const fbPayload = {
      data: [{
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_source_url: sourceUrl,
        action_source: 'website',
        event_id: params.get('gtm.eventId') || undefined,
        user_data: {
          client_ip_address: req.socket.remoteAddress,
          client_user_agent: req.headers['user-agent']
        },
        custom_data: {
          currency: currency,
          value: value,
          content_type: 'product',
          content_ids: ['bordopalla_001'] // Optional: update dynamically if needed
        }
      }]
    };

    const postData = JSON.stringify(fbPayload);
    const fbPath = `/v17.0/${FB_PIXEL_ID}/events?access_token=${FB_ACCESS_TOKEN}`;

    const fbReq = https.request(
      {
        hostname: 'graph.facebook.com',
        path: fbPath,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      },
      fbRes => {
        let body = '';
        fbRes.on('data', chunk => body += chunk);
        fbRes.on('end', () => {
          console.log(`✅ FB CAPI [${eventName}] → ${fbRes.statusCode}:`, body);
        });
      }
    );

    fbReq.on('error', err => console.error('❌ FB CAPI error:', err));
    fbReq.write(postData);
    fbReq.end();

    // Return immediately to GTM
    res.writeHead(204);
    return res.end();
  }

  // All other routes
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
