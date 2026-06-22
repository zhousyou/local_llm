import express, { Request, Response } from "express";
import cors from "cors";

const app = express();
const PORT = process.env.DEBUG_API_PORT || 3001;
const MAX_LOGS = 500;

interface DebugLog {
  id: string;
  type: "stdout" | "stderr" | "info" | "error";
  content: string;
  timestamp: number;
}

const logs: DebugLog[] = [];
const clients: Response[] = [];

app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

function generateId() {
  return Math.random().toString(36).slice(2, 11);
}

function addLog(type: DebugLog["type"], content: string) {
  const log: DebugLog = {
    id: generateId(),
    type,
    content,
    timestamp: Date.now(),
  };
  logs.push(log);
  if (logs.length > MAX_LOGS) {
    logs.shift();
  }

  const payload = JSON.stringify(log);
  clients.forEach((client) => {
    client.write(`data: ${payload}\n\n`);
  });
}

app.post("/api/debug/log", (req: Request, res: Response) => {
  const { content, type = "stdout" } = req.body;
  if (typeof content !== "string") {
    res.status(400).json({ error: "content must be a string" });
    return;
  }
  const validType: DebugLog["type"] = ["stdout", "stderr", "info", "error"].includes(type)
    ? type
    : "stdout";
  addLog(validType, content);
  res.json({ ok: true });
});

app.get("/api/debug/logs", (_req: Request, res: Response) => {
  res.json({ logs });
});

app.get("/api/debug/stream", (req: Request, res: Response) => {
  const headers = {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  };
  res.writeHead(200, headers);

  res.write(`data: ${JSON.stringify({ type: "connected", content: "", timestamp: Date.now() })}\n\n`);

  clients.push(res);

  req.on("close", () => {
    const index = clients.indexOf(res);
    if (index !== -1) {
      clients.splice(index, 1);
    }
  });
});

app.delete("/api/debug/logs", (_req: Request, res: Response) => {
  logs.length = 0;
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Debug API server listening on http://localhost:${PORT}`);
});
