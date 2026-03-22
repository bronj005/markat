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
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff'
};

const staticLike =
  /\.(js|css|json|ico|png|jpe?g|gif|svg|webp|woff2?|ttf|eot)$/i;

function sendFile(res, filePath) {
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
}

const server = http.createServer((req, res) => {
  const publicDir = __dirname;
  const url = new URL(req.url || '/', 'http://localhost');
  const pathname = decodeURIComponent(url.pathname);
  const relativePath =
    pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');
  let filePath = path.join(publicDir, relativePath);

  const realPath = path.resolve(filePath);
  if (!realPath.startsWith(path.resolve(publicDir))) {
    res.writeHead(403, { 'Content-Type': 'text/html' });
    res.end('403 - Forbidden');
    return;
  }

  fs.stat(filePath, (statErr, stats) => {
    if (!statErr && stats.isFile()) {
      sendFile(res, filePath);
      return;
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { 'Content-Type': 'text/html' });
      res.end('405 - Method Not Allowed');
      return;
    }

    if (staticLike.test(pathname)) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('404 - File Not Found');
      return;
    }

    const indexPath = path.join(publicDir, 'index.html');
    if (req.method === 'HEAD') {
      fs.stat(indexPath, (e, st) => {
        if (e || !st.isFile()) {
          res.writeHead(404);
          res.end();
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end();
      });
      return;
    }

    sendFile(res, indexPath);
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
