import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "../packages/widget/dist");
const projectRoot = path.join(__dirname, "..");
const PORT = 5175;

const MIME = {
  ".js": "application/javascript",
  ".html": "text/html",
  ".css": "text/css",
  ".json": "application/json",
};

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  const url = req.url.split("?")[0]; // strip query string

  // Serve test-widget.html from project root at / or /test-widget.html
  if (url === "/" || url === "/test-widget.html") {
    const htmlPath = path.join(projectRoot, "test-widget.html");
    fs.readFile(htmlPath, (err, data) => {
      if (err) { res.writeHead(404); res.end("Not found"); return; }
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(data);
    });
    return;
  }

  // Serve widget dist files
  const filePath = path.join(distDir, url);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": MIME[ext] ?? "text/plain" });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Widget static server running at http://localhost:${PORT}`);
  console.log(`  Test page:  http://localhost:${PORT}/`);
  console.log(`  Widget JS:  http://localhost:${PORT}/widget.js`);
});
