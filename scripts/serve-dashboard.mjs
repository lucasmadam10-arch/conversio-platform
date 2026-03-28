import http from "http";
import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "../packages/dashboard/dist");
const PORT = process.env["PORT"] ?? 5176;
const API_URL = process.env["API_URL"] ?? "http://localhost:4000";
const WS_URL = process.env["WS_URL"] ?? "ws://localhost:3001";

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
  const isHttps = target.protocol === "https:";
  const lib = isHttps ? https : http;
  const options = {
    hostname: target.hostname,
    port: target.port || (isHttps ? 443 : 80),
    path: target.pathname + target.search,
    method: req.method,
    headers: { ...req.headers, host: target.host },
  };

  const proxy = lib.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxy.on("error", () => {
    res.writeHead(502);
    res.end("API not reachable");
  });

  req.pipe(proxy);
}

// Inject WS_URL into HTML so the browser knows where to connect WebSocket
function injectEnv(html) {
  const script = `<script>window.__WS_URL__=${JSON.stringify(WS_URL)};</script>`;
  return html.replace("</head>", `${script}</head>`);
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

  // Proxy API calls to the backend service
  if (url.startsWith("/trpc") || url.startsWith("/widget") || url.startsWith("/internal") || url.startsWith("/health")) {
    proxyRequest(req, res);
    return;
  }

  // Try to serve static file
  const filePath = path.join(distDir, url === "/" ? "/index.html" : url);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // SPA fallback — serve index.html for client-side routing
      fs.readFile(path.join(distDir, "index.html"), (err2, html) => {
        if (err2) {
          res.writeHead(404);
          res.end("Dashboard not built yet.");
          return;
        }
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(injectEnv(html.toString()));
      });
      return;
    }

    const ext = path.extname(filePath);
    if (ext === ".html") {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(injectEnv(data.toString()));
      return;
    }

    res.writeHead(200, { "Content-Type": MIME[ext] ?? "text/plain" });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Dashboard running on port ${PORT}`);
  console.log(`  API proxy → ${API_URL}`);
  console.log(`  WS URL    → ${WS_URL}`);
});
