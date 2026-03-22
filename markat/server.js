const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const publicDir = __dirname;
  let filePath = path.join(publicDir, req.url === '/' ? 'index.html' : req.url);
  
  // Security: Prevent directory traversal attacks
  const realPath = path.resolve(filePath);
  if (!realPath.startsWith(path.resolve(publicDir))) {
    res.writeHead(403, { 'Content-Type': 'text/html' });
    res.end('403 - Forbidden');
    return;
  }

  fs.stat(filePath, (statErr, stats) => {
    if (statErr || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('404 - File Not Found');
      return;
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end('500 - Internal Server Error');
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[ext] || 'application/octet-stream';

      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
