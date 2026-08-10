const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const rooms = {};

const COLORS = [
  "#3B82F6", "#10B981", "#F59E0B", "#EF4444",
  "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16",
  "#F97316", "#6366F1",
];

const JUDGE0_URL = "https://ce.judge0.com";

const LANGUAGE_IDS = {
  javascript: 63,
  python: 71,
  cpp: 54,
  c: 50,
  java: 62,
  go: 60,
  rust: 73,
  typescript: 74,
};

app.post("/api/execute", async (req, res) => {
  const { code, language, stdin = "" } = req.body;
  const languageId = LANGUAGE_IDS[language];

  if (!languageId) {
    return res.json({
      stdout: "",
      stderr: `Language '${language}' is not supported.`,
      compile_output: "",
      status: "Unsupported Language",
    });
  }

  try {
    const submitRes = await axios.post(
      `${JUDGE0_URL}/submissions?base64_encoded=false`,
      { source_code: code, language_id: languageId, stdin },
      { headers: { "Content-Type": "application/json" } }
    );

    const token = submitRes.data.token;
    if (!token) throw new Error("Failed to receive execution token");

    let result;
    for (let i = 0; i < 10; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      const pollRes = await axios.get(
        `${JUDGE0_URL}/submissions/${token}?base64_encoded=false`,
        { headers: { "Content-Type": "application/json" } }
      );
      result = pollRes.data;
      if (result.status?.id > 2) break;
    }

    const { stdout, stderr, compile_output, status, time, memory } = result || {};
    res.json({
      stdout: stdout || "",
      stderr: stderr || "",
      compile_output: compile_output || "",
      status: status?.description || "Completed",
      time: time ? `${parseFloat(time).toFixed(3)}s` : null,
      memory: memory ? `${(memory / 1024).toFixed(1)} MB` : null,
    });
  } catch (err) {
    res.json({
      stdout: "",
      stderr: err.response?.data?.message || err.message || "Execution service unavailable.",
      compile_output: "",
      status: "Execution Error",
    });
  }
});

app.get("/api/room/:roomId", (req, res) => {
  const room = rooms[req.params.roomId];
  if (!room) return res.status(404).json({ error: "Room not found" });
  res.json({ code: room.code, language: room.language });
});

io.on("connection", (socket) => {
  socket.on("join-room", ({ roomId, username }) => {
    socket.join(roomId);

    if (!rooms[roomId]) {
      rooms[roomId] = {
        code: `// Real-Time Collaborative Editor\n// Select a language and start typing\n\nfunction main() {\n  console.log("Hello, Collaborative Coding!");\n}\n\nmain();\n`,
        language: "javascript",
        users: {},
      };
    }

    const color = COLORS[Object.keys(rooms[roomId].users).length % COLORS.length];
    rooms[roomId].users[socket.id] = { username, color };

    socket.emit("room-state", {
      code: rooms[roomId].code,
      language: rooms[roomId].language,
      users: rooms[roomId].users,
    });

    socket.to(roomId).emit("user-joined", {
      socketId: socket.id,
      username,
      color,
      users: rooms[roomId].users,
    });

    socket.data.roomId = roomId;
    socket.data.username = username;
  });

  socket.on("code-change", ({ roomId, code }) => {
    if (rooms[roomId]) rooms[roomId].code = code;
    socket.to(roomId).emit("code-update", { code });
  });

  socket.on("language-change", ({ roomId, language }) => {
    if (rooms[roomId]) rooms[roomId].language = language;
    socket.to(roomId).emit("language-update", { language });
  });

  socket.on("cursor-move", ({ roomId, position, selection }) => {
    socket.to(roomId).emit("cursor-update", {
      socketId: socket.id,
      username: socket.data.username,
      color: rooms[roomId]?.users[socket.id]?.color || "#3B82F6",
      position,
      selection,
    });
  });

  socket.on("disconnect", () => {
    const { roomId, username } = socket.data || {};
    if (roomId && rooms[roomId]) {
      delete rooms[roomId].users[socket.id];
      io.to(roomId).emit("user-left", {
        socketId: socket.id,
        username,
        users: rooms[roomId].users,
      });

      if (Object.keys(rooms[roomId].users).length === 0) {
        delete rooms[roomId];
      }
    }
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
