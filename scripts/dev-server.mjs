// Local preview without Vercel:  npm run dev   →  http://localhost:3000
// Serves public/ and runs the functions in api/ the way Vercel does (req.query, req.body, res.status().json()).
// Reads .env.local if it exists. For the real thing use `vercel dev`.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
if (existsSync(path.join(root, '.env.local'))) {
  for (const line of readFileSync(path.join(root, '.env.local'), 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
  }
}
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.mp4': 'video/mp4' };

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  try {
    const api = url.pathname.match(/^\/api\/([a-z0-9-]+)$/);
    if (api) {
      const file = path.join(root, 'api', api[1] + '.js');
      if (!existsSync(file)) { res.writeHead(404).end('Not found'); return; }
      const chunks = []; for await (const c of req) chunks.push(c);
      const raw = Buffer.concat(chunks).toString('utf8'), type = req.headers['content-type'] || '';
      req.query = Object.fromEntries(url.searchParams);
      req.body = type.includes('application/json') && raw ? JSON.parse(raw) : raw;
      res.status = code => { res.statusCode = code; return res; };
      res.json = o => { res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.end(JSON.stringify(o)); return res; };
      const mod = await import(pathToFileURL(file).href);
      await mod.default(req, res);
      return;
    }
    const pub = path.join(root, 'public');
    let file = path.normalize(path.join(pub, decodeURIComponent(url.pathname)));
    if (!file.startsWith(pub)) { res.writeHead(403).end(); return; }
    if (url.pathname.endsWith('/')) file = path.join(file, 'index.html');
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' }).end(data);
  } catch (e) {
    if (e.code === 'ENOENT' || e.code === 'EISDIR') res.writeHead(404).end('Not found');
    else { console.error(e); if (!res.headersSent) res.writeHead(500); res.end('Server error'); }
  }
}).listen(Number(process.env.PORT) || 3000, () => console.log('Do it English → http://localhost:' + (Number(process.env.PORT) || 3000)));
