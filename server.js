const http = require('http');

const server = http.createServer((req, res) => {
  if (req.url === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

// ✅ Use 8090 instead of 8080 to avoid conflict with NGINX
const PORT = 8090;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
