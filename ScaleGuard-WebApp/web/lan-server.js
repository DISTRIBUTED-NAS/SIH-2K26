import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Port configuration: default to 80, support args e.g. --port 5173 or env PORT
const getRequestedPort = () => {
  const portArgIndex = process.argv.indexOf('--port');
  if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
    return parseInt(process.argv[portArgIndex + 1], 10);
  }
  return process.env.PORT ? parseInt(process.env.PORT, 10) : 80;
};

const BACKEND_HOST = process.env.BACKEND_HOST || '127.0.0.1';
const BACKEND_PORT = process.env.BACKEND_PORT ? parseInt(process.env.BACKEND_PORT, 10) : 8080;
const DIST_DIR = path.resolve(__dirname, 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.mjs': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf',
  '.txt': 'text/plain; charset=UTF-8',
};

// Find LAN IPv4 addresses
const getNetworkAddresses = () => {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        addresses.push({ name, address: net.address });
      }
    }
  }
  return addresses;
};

// Stream reverse proxy to Spring Boot backend
const proxyApiRequest = (req, res) => {
  const options = {
    hostname: BACKEND_HOST,
    port: BACKEND_PORT,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: `${BACKEND_HOST}:${BACKEND_PORT}`,
      'x-forwarded-for': req.socket.remoteAddress || '',
      'x-forwarded-proto': 'http',
    },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error(`[API Proxy Error] ${req.method} ${req.url} -> ${err.message}`);
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Bad Gateway: Backend server unreachable', details: err.message }));
    }
  });

  req.pipe(proxyReq);
};

// Static file server with SPA routing fallback to index.html
const serveStatic = (req, res) => {
  const urlPath = req.url.split('?')[0];
  let safePath = path.normalize(decodeURIComponent(urlPath)).replace(/^(\.\.[/\\])+/, '');
  let filePath = path.join(DIST_DIR, safePath);

  // If path is a directory or root, check for index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  // If file does not exist, fallback to index.html (Single Page Application routing)
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('ScaleGuard build not found. Please run "npm run build" first.');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  const stream = fs.createReadStream(filePath);
  stream.on('open', () => {
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
    });
  });
  stream.on('error', (err) => {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end(`Internal Server Error: ${err.message}`);
  });
  stream.pipe(res);
};

const server = http.createServer((req, res) => {
  const timestamp = new Date().toLocaleTimeString();
  const clientIp = req.socket.remoteAddress?.replace('::ffff:', '') || 'client';

  // Enable CORS headers for safety
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url.startsWith('/api')) {
    console.log(`[${timestamp}] ${clientIp} -> API ${req.method} ${req.url}`);
    proxyApiRequest(req, res);
  } else {
    serveStatic(req, res);
  }
});

const startServer = (port) => {
  server.listen(port, '0.0.0.0', () => {
    const addresses = getNetworkAddresses();
    console.log('\n================================================================');
    console.log('       SCALEGUARD PRODUCTION LAN SERVER RUNNING');
    console.log('================================================================');
    console.log(`  Local Access:      http://localhost${port === 80 ? '' : ':' + port}`);
    console.log(`  LAN IP Addresses:`);
    addresses.forEach((net) => {
      console.log(`   * ${net.name.padEnd(25)} -> http://${net.address}${port === 80 ? '' : ':' + port}`);
    });
    console.log('----------------------------------------------------------------');
    console.log(`  Backend Proxy:     http://${BACKEND_HOST}:${BACKEND_PORT}`);
    console.log('  Static Directory:  ' + DIST_DIR);
    console.log('================================================================\n');
  });

  server.on('error', (err) => {
    if (err.code === 'EACCES' || err.code === 'EADDRINUSE') {
      if (port === 80) {
        console.warn(`[WARN] Port 80 not available (${err.message}). Retrying on port 5173...`);
        startServer(5173);
      } else {
        console.error(`[ERROR] Server failed on port ${port}:`, err.message);
      }
    } else {
      console.error('[ERROR] Server error:', err);
    }
  });
};

const initialPort = getRequestedPort();
startServer(initialPort);
