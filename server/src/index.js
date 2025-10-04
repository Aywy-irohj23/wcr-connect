import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { v4 as uuid } from "uuid";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());
app.use("/files", express.static("public/files")); // для demo-пдфов

// ---- DEMO DATA (in-memory) ----
const users = [
  { id: "u-admin", username: "admin", password: "start123", role: "admin" },
  { id: "u-jan", username: "jan.kowalski", password: "start123", role: "reservist", group: "PR", status: "passive" },
  { id: "u-anna", username: "anna.nowak", password: "start123", role: "reservist", group: "AR", status: "active" }
];

const messages = []; // {id, type, title, body, sender, phone, place, datetime, attachments, target:{group, individuals}, required, createdAt}
const responses = []; // {id, messageId, userId, action, meta, createdAt}
const sessions = new Map(); // token -> userId

// ---- AUTH (простая, демо-токен) ----
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body || {};
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  const token = uuid();
  sessions.set(token, user.id);
  res.json({ token, user: { id: user.id, username: user.username, role: user.role, group: user.group, status: user.status } });
});

function auth(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  const userId = token && sessions.get(token);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  req.user = users.find(u => u.id === userId);
  next();
}

// ---- USER: list & detail ----
app.get("/api/messages", auth, (req, res) => {
  const me = req.user;
  // Фильтрация: по группе/индивидуалам/всем
  const list = messages.filter(m => {
    if (m.target?.group && m.target.group !== "all" && m.target.group !== me.group) return false;
    if (m.target?.individuals?.length && !m.target.individuals.includes(me.id)) return false;
    return true;
  }).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(list);
});

app.get("/api/messages/:id", auth, (req, res) => {
  const m = messages.find(x => x.id === req.params.id);
  if (!m) return res.status(404).json({ error: "Not found" });
  res.json(m);
});

app.post("/api/messages/:id/respond", auth, (req, res) => {
  const { action } = req.body || {};
  if (!["acknowledged", "declined"].includes(action)) {
    return res.status(400).json({ error: "Bad action" });
  }
  const msg = messages.find(x => x.id === req.params.id);
  if (!msg) return res.status(404).json({ error: "Not found" });
  const r = {
    id: uuid(),
    messageId: msg.id,
    userId: req.user.id,
    action,
    meta: { ip: req.ip, agent: req.headers["user-agent"] },
    createdAt: new Date().toISOString()
  };
  responses.push(r);
  io.to(msg.id).emit("message:response", { messageId: msg.id, userId: req.user.id, action });
  res.json({ ok: true });
});

// ---- ADMIN: create & stats ----
function isAdmin(req, res, next) {
  if (req.user?.role !== "admin") return res.status(403).json({ error: "Forbidden" });
  next();
}

app.post("/api/admin/messages", auth, isAdmin, (req, res) => {
  const payload = req.body || {};
  const m = {
    id: uuid(),
    type: payload.type || "Komunikat",
    title: payload.title || "Untitled",
    body: payload.body || "",
    sender: payload.sender || "WCR",
    phone: payload.phone || "",
    place: payload.place || "",
    datetime: payload.datetime || new Date().toISOString(),
    attachments: payload.attachments || [],
    target: payload.target || { group: "all", individuals: [] },
    required: !!payload.required,
    createdAt: new Date().toISOString()
  };
  messages.push(m);

  // Socket уведомление (по группам/индивидуалам — для демо просто broadcast)
  io.emit("message:new", m);
  res.json(m);
});

app.get("/api/admin/messages", auth, isAdmin, (req, res) => {
  const withStats = messages.map(m => {
    const r = responses.filter(x => x.messageId === m.id);
    const ack = r.filter(x => x.action === "acknowledged").length;
    const dec = r.filter(x => x.action === "declined").length;
    return { ...m, stats: { total: r.length, acknowledged: ack, declined: dec } };
  });
  res.json(withStats);
});

app.get("/api/admin/messages/:id/responses", auth, isAdmin, (req, res) => {
  const r = responses.filter(x => x.messageId === req.params.id);
  res.json(r);
});

// ---- SOCKET.IO ----
io.on("connection", socket => {
  socket.on("joinMessageRoom", (messageId) => socket.join(messageId));
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => console.log(`[server] listening on ${PORT}`));

