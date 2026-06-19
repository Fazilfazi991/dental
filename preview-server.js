const http = require("http");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const root = path.resolve(__dirname);
const port = Number(process.env.PORT || 8080);
const host = "127.0.0.1";
const maxUploadBytes = 14 * 1024 * 1024;

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

const sendJson = (res, status, payload) => {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
};

const collectRequestBody = (req) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;

    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > maxUploadBytes) {
        reject(new Error("Image is too large. Please upload an image under 14 MB."));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });

const parseMultipart = (body, contentType) => {
  const boundaryMatch = /boundary=([^;]+)/i.exec(contentType || "");
  if (!boundaryMatch) {
    throw new Error("Invalid upload request.");
  }

  const boundary = Buffer.from(`--${boundaryMatch[1].replace(/^"|"$/g, "")}`);
  const fields = {};
  let file = null;
  let position = 0;

  while (position < body.length) {
    const start = body.indexOf(boundary, position);
    if (start === -1) break;

    const partStart = start + boundary.length;
    if (body[partStart] === 45 && body[partStart + 1] === 45) break;

    const headersStart = partStart + 2;
    const headersEnd = body.indexOf(Buffer.from("\r\n\r\n"), headersStart);
    if (headersEnd === -1) break;

    const headers = body.slice(headersStart, headersEnd).toString("utf8");
    const next = body.indexOf(boundary, headersEnd + 4);
    if (next === -1) break;

    let data = body.slice(headersEnd + 4, next);
    if (data.slice(-2).toString() === "\r\n") {
      data = data.slice(0, -2);
    }

    const name = /name="([^"]+)"/i.exec(headers)?.[1];
    const filename = /filename="([^"]*)"/i.exec(headers)?.[1];
    const mimeType = /content-type:\s*([^\r\n]+)/i.exec(headers)?.[1] || "application/octet-stream";

    if (name && filename) {
      file = { fieldName: name, filename, mimeType, data };
    } else if (name) {
      fields[name] = data.toString("utf8");
    }

    position = next;
  }

  return { fields, file };
};

const sanitizeFilename = (filename) =>
  path
    .basename(filename || "dentiva-image")
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9_-]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70) || "dentiva-image";

const convertImage = async (req, res) => {
  try {
    const body = await collectRequestBody(req);
    const { fields, file } = parseMultipart(body, req.headers["content-type"]);
    const format = String(fields.format || "webp").toLowerCase();
    const quality = Math.min(100, Math.max(40, Number(fields.quality || 82)));

    if (!file || !file.data.length) {
      sendJson(res, 400, { error: "Please upload an image to convert." });
      return;
    }

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.mimeType)) {
      sendJson(res, 400, { error: "Upload a PNG, JPG, JPEG, or WebP image." });
      return;
    }

    if (!["webp", "jpg", "jpeg", "png"].includes(format)) {
      sendJson(res, 400, { error: "Choose WebP, JPG, or PNG as the output format." });
      return;
    }

    let transformer = sharp(file.data, { failOn: "none" }).rotate();
    let extension = format;
    let contentType = `image/${format}`;

    if (format === "webp") {
      transformer = transformer.webp({ quality, effort: 5 });
    } else if (format === "png") {
      transformer = transformer.png({ compressionLevel: 9, adaptiveFiltering: true });
    } else {
      extension = "jpg";
      contentType = "image/jpeg";
      transformer = transformer.jpeg({ quality, mozjpeg: true });
    }

    const output = await transformer.toBuffer();
    const filename = `${sanitizeFilename(file.filename)}.${extension}`;

    res.writeHead(200, {
      "Content-Type": contentType,
      "Content-Length": output.length,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    });
    res.end(output);
  } catch (error) {
    sendJson(res, error.message.includes("too large") ? 413 : 500, {
      error: error.message || "Unable to convert this image.",
    });
  }
};

const server = http.createServer((req, res) => {
  if (req.method === "POST" && new URL(req.url, `http://${host}:${port}`).pathname === "/api/convert-image") {
    convertImage(req, res);
    return;
  }

  const requestPath = decodeURIComponent(new URL(req.url, `http://${host}:${port}`).pathname);
  const safePath = path.normalize(requestPath).replace(/^[/\\]+/, "").replace(/^(\.\.[/\\])+/, "");
  let filePath = path.resolve(root, safePath === "" ? "index.html" : safePath);

  if (!filePath.toLowerCase().startsWith(root.toLowerCase())) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    res.writeHead(200, { "Content-Type": types[path.extname(filePath)] || "application/octet-stream" });
    res.end(data);
  });
});

server.listen(port, host, () => {
  console.log(`Preview running at http://${host}:${port}`);
});
