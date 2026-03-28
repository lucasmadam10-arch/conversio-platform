import http from "http";
import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "../packages/dashboard/dist");
const PORT = 5176;
const API_URL = "http://localhost:4000";

const MIME = {
  ".html": "text/html",
  ".js":   "application/javascript",
  ".css":  "text/css",
  ".json": "application/json",
  ".svg":  "image/svg+xml",
  ".png":  "image/png",
  ".ico":  "image/x-icon",
};

function proxyRequest(req, res) {
  const target = new URL(req.url, API_URL);
  const options = {
    hostname: target.hostname,
    port: target.port || 4000,
    path: target.pathname + target.search,
    method: req.method,
    headers: { ...req.headers, host: target.host },
  };

  const proxy = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxy.on("error", () => {
    res.writeHead(502);
    res.end("API not reachable — is the API running on port 4000?");
  });

  req.pipe(proxy);
}

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = req.url.split("?")[0];

  // Proxy API calls to the backend
  if (url.startsWith("/trpc") || url.startsWith("/widget") || url.startsWith("/internal") || url.startsWith("/health")) {
    proxyRequest(req, res);
    return;
  }

  // Try to serve static file
  let filePath = path.join(distDir, url === "/" ? "/index.html" : url);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // SPA fallback — serve index.html for all unknown routes
      fs.readFile(path.join(distDir, "index.html"), (err2, html) => {
        if (err2) {
          res.writeHead(404);
          res.end("Dashboard not built yet. Run: pnpm --filter @conversio/dashboard build");
          return;
        }
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(html);
      });
      return;
    }

    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": MIME[ext] ?? "text/plain" });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Dashboard server running at http://localhost:${PORT}`);
  console.log(`  Login:  http://localhost:${PORT}/login`);
  console.log(`  Inbox:  http://localhost:${PORT}/inbox`);
  console.log(`  API proxy → ${API_URL}`);
});
