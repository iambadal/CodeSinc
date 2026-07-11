<div align="center">

# Real-Time Collaborative Code Editor
### Rename repo to: `realtime-code-editor` (slightly cleaner, keep `collab-code-editor` if you prefer — either reads well)

Google-Docs-style collaboration, but for code — with in-browser execution across multiple languages.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://collab-code-editor-psi.vercel.app)
![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat-square&logo=socketdotio&logoColor=white)
![Monaco Editor](https://img.shields.io/badge/Monaco%20Editor-007ACC?style=flat-square&logo=visualstudiocode&logoColor=white)
![Judge0](https://img.shields.io/badge/Judge0%20API-FF6B00?style=flat-square)

<!-- Suggested repo description: -->
<!-- Real-time collaborative code editor with room-based multi-user sync (Socket.io + Monaco Editor) and in-browser multi-language code execution via Judge0 API. -->

</div>

## Overview

Built for pair programming and interview-style collaboration: multiple users join a room and edit the same file simultaneously, with cursor and content changes synced live. Code can be compiled and executed for real inside the browser, in several languages, without any local setup.

## Key Features

- **Room-based collaboration** — unique room IDs, multiple simultaneous editors
- **Live sync** — Socket.io broadcasts every keystroke/change with minimal latency
- **Monaco Editor** — the same editor engine behind VS Code, with syntax highlighting and IntelliSense
- **Multi-language execution** — Judge0 API compiles and runs code server-side and returns output in-browser
- **No setup required** — join a room link and start coding immediately

## Architecture

```
collab-code-editor/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Editor/        # Monaco integration
│   │   │   ├── RoomJoin/
│   │   │   └── OutputPanel/
│   │   ├── socket/             # socket.io-client setup
│   │   └── pages/
├── server/
│   ├── index.js                # Express + Socket.io server
│   ├── socketHandlers/         # room join/leave/sync events
│   └── services/
│       └── judge0.js           # code execution service
└── README.md
```

## How Sync Works

1. A user creates or joins a room via a unique room ID
2. The server maintains room state and broadcasts change events to all connected clients in that room via Socket.io
3. Monaco Editor's change events are debounced and emitted to avoid flooding the socket connection
4. On "Run", the current code + selected language is sent to the Judge0 API, and stdout/stderr is streamed back to all users in the room

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Monaco Editor |
| Real-time | Socket.io |
| Code Execution | Judge0 API |
| Backend | Node.js, Express |

## Live Demo

**[collab-code-editor-psi.vercel.app](https://collab-code-editor-psi.vercel.app)**

<!-- SCREENSHOT SUGGESTIONS:
1. Two browser windows side-by-side showing the same room with synced edits (this is the money shot — proves real-time works)
2. Language selector dropdown + output panel showing executed result
3. Room join screen

DEMO GIF IDEA:
Split-screen recording: two browser windows, same room. Type in window A, show it appear instantly in window B. Then run code and show output panel populate. 15-20s, this single GIF will do more for you than any paragraph of description. -->

## Getting Started

```bash
git clone https://github.com/Manigupta03/realtime-code-editor.git
cd realtime-code-editor

# Server
cd server && npm install
cp .env.example .env   # add JUDGE0_API_KEY
npm run dev

# Client
cd ../client && npm install
npm run dev
```

## Roadmap / Improvement Ideas

- [ ] Add operational transformation or CRDT (e.g. Yjs) for true conflict-free concurrent editing at scale
- [ ] Add per-user cursor colors and name labels
- [ ] Add chat/voice alongside the editor for pair-programming sessions
- [ ] Persist room sessions (currently likely in-memory — document this limitation if so)
- [ ] Rate-limit Judge0 calls to avoid API quota exhaustion

## Suggested GitHub Topics
`socketio` `real-time` `monaco-editor` `collaborative-editor` `judge0-api` `react` `nodejs` `pair-programming`

---

<div align="center">Built by <a href="https://github.com/Manigupta03">Mani Gupta</a></div>
