# CodeSinc — Real-Time Collaborative Code Editor

**Code together. Execute instantly. Collaborate from anywhere.**

CodeSinc is a browser-based collaborative code editor that allows multiple users to work in the same coding room in real time. Built with React, Monaco Editor, and Socket.IO, it synchronizes code changes and cursor activity between collaborators while providing an integrated environment to execute code using the Judge0 API.

No local development setup is required to start collaborating.

<p align="center">
  <a href="https://collab-code-editor-psi.vercel.app">
    <img src="https://img.shields.io/badge/Live%20Demo-Visit%20CodeSinc-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo"/>
  </a>
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"/>
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"/>
  <img src="https://img.shields.io/badge/Socket.IO-Real--Time-010101?style=for-the-badge&logo=socketdotio&logoColor=white" alt="Socket.IO"/>
  <img src="https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js"/>
</p>

---

## Overview

CodeSinc is designed to make pair programming, collaborative problem-solving, and remote coding sessions easier.

Users can create or join a shared room and collaborate through a common code editor. Changes are synchronized through a Socket.IO connection, allowing collaborators to see updates without manually refreshing the page.

The application also integrates Judge0 for code execution, making it possible to write, run, and inspect program output directly inside the browser.

## Features

- **Real-Time Collaboration:** Multiple users can join the same room and collaborate on shared code.
- **Room-Based Sessions:** Create or join coding sessions using unique room IDs.
- **Live Code Synchronization:** Code updates are communicated between connected users using Socket.IO.
- **Live Cursor Updates:** Collaborators can see cursor activity from other connected users.
- **Collaborator Presence:** View users currently connected to the coding session.
- **Monaco Code Editor:** A VS Code-powered editing experience with syntax highlighting and language-aware editing.
- **Multi-Language Code Execution:** Execute supported programming languages through the Judge0 API.
- **Integrated Output Panel:** Inspect execution results directly within the application.
- **Language Selection:** Switch the editor's programming language for different coding tasks.
- **Modern Frontend:** Built with Vite for a fast development workflow and optimized production builds.

## Application Preview

<!-- Add screenshots here after capturing your actual application UI.

Suggested screenshots:
1. Home page / room creation screen
2. Collaborative editor with two users connected
3. Code editor with language selection and execution output

Example:

<p align="center">
  <img src="screenshots/home.png" width="85%" alt="CodeSinc Home"/>
</p>

-->

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 18, Vite 8, JavaScript |
| UI / Code Editing | Monaco Editor |
| Styling | CSS |
| Real-Time Communication | Socket.IO |
| Backend | Node.js, Express.js |
| Code Execution | Judge0 API |
| HTTP Requests | Axios |
| Routing | React Router |
| Deployment | Vercel (frontend), backend deployment configured separately |

## System Architecture

```text
                    ┌──────────────────────┐
                    │       Users          │
                    │  Browser / Client    │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │    React + Vite      │
                    │    Client App        │
                    └──────────┬───────────┘
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
                 ▼                           ▼
        ┌─────────────────┐        ┌─────────────────┐
        │   Monaco Editor │        │  Axios Request  │
        │  Code & Cursor  │        │  Code Execution │
        └────────┬────────┘        └────────┬────────┘
                 │                          │
                 ▼                          ▼
        ┌─────────────────┐        ┌─────────────────┐
        │   Socket.IO     │        │  Express Server │
        │  Real-Time Sync │        │  Execution API  │
        └────────┬────────┘        └────────┬────────┘
                 │                          │
                 ▼                          ▼
        ┌─────────────────┐        ┌─────────────────┐
        │  Node.js Server │        │    Judge0 API   │
        │   Room Events   │        │ Code Compilation│
        └─────────────────┘        └─────────────────┘
```

## How It Works

### 1. Room Creation and Joining
A user creates or joins a coding room using a unique room ID. Other users can join the same room to participate in the session.

### 2. Real-Time Connection
The frontend establishes a Socket.IO connection with the Node.js backend. Once connected, users join their respective rooms.

### 3. Code Synchronization
When a user edits code, the frontend sends updates through Socket.IO. The server processes the room events and broadcasts relevant updates to other connected collaborators.

### 4. Cursor and Presence Updates
Cursor movements and collaborator presence are communicated through socket events, helping users follow activity within the shared editor.

### 5. Code Execution
When a user clicks the Run button, the application sends the source code and selected language to the backend. The backend communicates with Judge0, which executes the code and returns the result to the application.

## Project Structure

```text
CodeSinc/
│
├── client/
│   ├── index.html
│   ├── vite.config.mjs
│   ├── package.json
│   └── src/
│       ├── components/
│       │   ├── OutputPanel.jsx
│       │   └── UsersList.jsx
│       ├── context/
│       │   └── SocketContext.jsx
│       ├── pages/
│       │   ├── Home.jsx
│       │   └── EditorPage.jsx
│       ├── App.jsx
│       ├── App.css
│       └── main.jsx
│
├── server/
│   ├── index.js
│   ├── package.json
│   └── .env.example
│
└── .gitignore
```

## Getting Started

Follow these steps to run CodeSinc locally.

### Prerequisites

- Node.js and npm
- Git
- A Judge0 API key or configured Judge0 endpoint

### 1. Clone the Repository

```bash
git clone https://github.com/iambadal/CodeSinc.git
cd CodeSinc
```

### 2. Configure the Backend

```bash
cd server
npm install
```

Create a `.env` file using the provided example:

```bash
cp .env.example .env
```

Configure the required environment variables in `server/.env`, including the Judge0 credentials and any backend configuration required by the project.

Start the backend:

```bash
npm run dev
```

The backend runs on port `5001` by default.

### 3. Configure the Frontend

Open another terminal:

```bash
cd client
npm install
```

Create a `client/.env` file and configure the backend URL:

```env
VITE_SERVER_URL=http://localhost:5001
```

Start the frontend:

```bash
npm run dev
```

The Vite development server runs at:

```text
http://localhost:5173
```

Open the application in your browser and start collaborating.

## Environment Variables

| Variable | Purpose |
|---|---|
| `PORT` | Backend server port; defaults to `5001` |
| `VITE_SERVER_URL` | Backend URL used by the frontend |
| Judge0 configuration | API credentials and endpoint required by the execution service |

Use the actual variable names defined in `server/.env.example` for Judge0 configuration. Never commit real API keys or secrets.

## Available Scripts

### Frontend (`client`)

| Command | Description |
|---|---|
| `npm run dev` | Start Vite development server |
| `npm run build` | Generate production build |
| `npm run preview` | Preview production build locally |

### Backend (`server`)

| Command | Description |
|---|---|
| `npm run dev` | Start backend using Nodemon |
| `npm start` | Start backend using Node.js |

## Current Limitations

- **In-Memory Room State:** Room information is maintained in server memory. Room state is not backed by persistent database storage, so it may be lost when the server restarts.
- **Concurrent Editing:** The application synchronizes live updates but does not currently implement a dedicated CRDT or Operational Transformation engine for conflict-free concurrent editing.
- **Session Persistence:** Persistent room history and recovery are not currently provided.

## Future Improvements

- [ ] Implement CRDT-based collaboration using Yjs.
- [ ] Add persistent room sessions and code history.
- [ ] Introduce user authentication and access control.
- [ ] Add chat functionality for collaborators.
- [ ] Improve cursor visualization with unique user colors and labels.
- [ ] Add room ownership and session management.
- [ ] Implement execution rate limiting and improved error handling.
- [ ] Add automated testing and deployment workflows.

## What I Learned

Building CodeSinc helped me gain practical experience with:

- Building and migrating a React application from Create React App to Vite.
- Designing real-time communication using Socket.IO.
- Managing shared state across multiple connected clients.
- Integrating a browser-based code editor using Monaco Editor.
- Building backend APIs with Node.js and Express.
- Integrating third-party code execution services through REST APIs.
- Managing frontend-backend communication and environment configuration.
- Preparing a full-stack application for production deployment.

## Author

**Badal Pujhari**

B.Tech — Computer Science and Engineering

[GitHub](https://github.com/iambadal)

---

<p align="center">
  <b>CodeSinc — One room. Multiple developers. One shared coding experience.</b>
  <br/>
  Built with ❤️ by Badal Pujhari
</p>
