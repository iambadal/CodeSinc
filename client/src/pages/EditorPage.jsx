import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import axios from "axios";
import { useSocket } from "../context/SocketContext";
import UsersList from "../components/UsersList";
import OutputPanel from "../components/OutputPanel";

/* ── Language definitions ───────────────────────────────── */
const LANGUAGES = [
  { value: "javascript", label: "JavaScript",  ext: "js"  },
  { value: "python",     label: "Python 3",    ext: "py"  },
  { value: "cpp",        label: "C++ (GCC)",   ext: "cpp" },
  { value: "c",          label: "C (GCC)",     ext: "c"   },
  { value: "java",       label: "Java",        ext: "java"},
  { value: "go",         label: "Go",          ext: "go"  },
  { value: "rust",       label: "Rust",        ext: "rs"  },
  { value: "typescript", label: "TypeScript",  ext: "ts"  },
];

const DEFAULT_CODE = {
  javascript: `function solve() {\n  const greeting = "Hello from Real-Time Collaborative Editor!";\n  console.log(greeting);\n}\n\nsolve();\n`,
  python:     `def main():\n    greeting = "Hello from Real-Time Collaborative Editor!"\n    print(greeting)\n\nif __name__ == "__main__":\n    main()\n`,
  cpp:        `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello from Real-Time Collaborative Editor!" << endl;\n    return 0;\n}\n`,
  c:          `#include <stdio.h>\n\nint main() {\n    printf("Hello from Real-Time Collaborative Editor!\\n");\n    return 0;\n}\n`,
  java:       `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Real-Time Collaborative Editor!");\n    }\n}\n`,
  go:         `package main\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello from Real-Time Collaborative Editor!")\n}\n`,
  rust:       `fn main() {\n    println!("Hello from Real-Time Collaborative Editor!");\n}\n`,
  typescript: `const greet = (msg: string): void => {\n  console.log(msg);\n};\n\ngreet("Hello from Real-Time Collaborative Editor!");\n`,
};

/* ── Inline SVG icons ───────────────────────────────────── */
const IconCode = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);
const IconCopy = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);
const IconCheck = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconDownload = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const IconLink = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);
const IconRun = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);
const IconChevronDown = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const IconGlobe = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);
const IconDoor = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const IconChevronUp = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15" />
  </svg>
);
const IconChevronDown2 = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

/* ══════════════════════════════════════════════════════════
   EDITOR PAGE
   ══════════════════════════════════════════════════════════ */
export default function EditorPage() {
  const { roomId }  = useParams();
  const location    = useLocation();
  const navigate    = useNavigate();
  const { socket, backendUrl } = useSocket();

  const username = location.state?.username || localStorage.getItem("collabcode_username");

  const [code,       setCode]       = useState("// Loading workspace…\n");
  const [language,   setLanguage]   = useState("javascript");
  const [stdin,      setStdin]      = useState("");
  const [users,      setUsers]      = useState({});
  const [output,     setOutput]     = useState(null);
  const [isRunning,  setIsRunning]  = useState(false);
  const [copied,     setCopied]     = useState(false);
  const [toasts,     setToasts]     = useState([]);
  const [showOutput, setShowOutput] = useState(false);

  const editorRef          = useRef(null);
  const monacoRef          = useRef(null);
  const remoteDecorations  = useRef(new Map());
  const isRemoteUpdate     = useRef(false);
  const cursorThrottleRef  = useRef(null);
  const runCodeRef         = useRef();

  /* ── Toast helper ─────────────────────────────────────── */
  const addToast = useCallback((msg) => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  /* ── Auth guard ───────────────────────────────────────── */
  useEffect(() => {
    if (!username) navigate("/", { replace: true });
  }, [username, navigate]);

  /* ── Code execution ───────────────────────────────────── */
  const runCode = useCallback(async () => {
    if (isRunning) return;
    setIsRunning(true);
    setShowOutput(true);

    try {
      const { data } = await axios.post(`${backendUrl}/api/execute`, {
        code: editorRef.current ? editorRef.current.getValue() : code,
        language,
        stdin,
      });
      setOutput(data);
    } catch (err) {
      setOutput({
        stderr:         err.response?.data?.message || err.message || "Execution service unavailable.",
        stdout:         "",
        compile_output: "",
        status:         "Error",
      });
    } finally {
      setIsRunning(false);
    }
  }, [backendUrl, code, language, stdin, isRunning]);

  runCodeRef.current = runCode;

  /* ── Monaco mount ─────────────────────────────────────── */
  const handleEditorMount = (editor, monaco) => {
    editorRef.current  = editor;
    monacoRef.current  = monaco;

    // Ctrl/Cmd+Enter → run
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      runCodeRef.current();
    });

    // Broadcast code delta
    editor.onDidChangeModelContent((e) => {
      if (isRemoteUpdate.current) return;
      const fullCode = editor.getValue();
      socket?.emit("code-delta", { roomId, changes: e.changes, fullCode });
    });

    // Broadcast cursor
    editor.onDidChangeCursorPosition((e) => {
      if (!socket || !roomId) return;
      if (cursorThrottleRef.current) return;
      cursorThrottleRef.current = requestAnimationFrame(() => {
        cursorThrottleRef.current = null;
        if (!editorRef.current) return;
        const sel = editorRef.current.getSelection();
        socket.emit("cursor-move", {
          roomId,
          position: e.position,
          selection: {
            startLineNumber: sel.startLineNumber,
            startColumn:     sel.startColumn,
            endLineNumber:   sel.endLineNumber,
            endColumn:       sel.endColumn,
          },
        });
      });
    });
  };

  /* ── Socket events ────────────────────────────────────── */
  useEffect(() => {
    if (!socket || !username) return;

    const handleConnect = () => socket.emit("join-room", { roomId, username });
    if (socket.connected) handleConnect();
    socket.on("connect", handleConnect);

    socket.on("room-state", ({ code: c, language: l, users: u }) => {
      isRemoteUpdate.current = true;
      setCode(c); setLanguage(l); setUsers(u);
      setTimeout(() => { isRemoteUpdate.current = false; }, 50);
    });

    socket.on("user-joined", ({ username: n, users: u }) => {
      setUsers(u);
      addToast(`${n} joined the session`);
    });

    socket.on("user-left", ({ socketId, username: n, users: u }) => {
      setUsers(u);
      addToast(`${n} left the session`);
      if (editorRef.current && remoteDecorations.current.has(socketId)) {
        const old = remoteDecorations.current.get(socketId);
        editorRef.current.deltaDecorations(old, []);
        remoteDecorations.current.delete(socketId);
      }
      const safeId = socketId.replace(/[^a-zA-Z0-9]/g, "");
      document.getElementById(`cursor-style-${safeId}`)?.remove();
    });

    socket.on("code-delta-update", ({ socketId, changes, fullCode }) => {
      if (socketId === socket.id || !editorRef.current || !monacoRef.current) return;
      const monaco = monacoRef.current;
      const edits  = changes.map((c) => ({
        range: new monaco.Range(c.range.startLineNumber, c.range.startColumn, c.range.endLineNumber, c.range.endColumn),
        text: c.text,
        forceMoveMarkers: true,
      }));
      isRemoteUpdate.current = true;
      editorRef.current.executeEdits("remote-user", edits);
      setCode(fullCode);
      setTimeout(() => { isRemoteUpdate.current = false; }, 0);
    });

    socket.on("code-update", ({ code: c }) => {
      isRemoteUpdate.current = true;
      setCode(c);
      setTimeout(() => { isRemoteUpdate.current = false; }, 0);
    });

    socket.on("language-update", ({ language: l }) => setLanguage(l));

    socket.on("cursor-update", ({ socketId, username: rName, color, position, selection }) => {
      if (!editorRef.current || !monacoRef.current || socketId === socket.id) return;
      const monaco    = monacoRef.current;
      const newDecs   = [];
      const isLineOne = position?.lineNumber === 1;

      if (position) {
        newDecs.push({
          range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column + 1),
          options: {
            className: `remote-cursor-${socketId.replace(/[^a-zA-Z0-9]/g, "")}`,
            hoverMessage: { value: `**${rName}**` },
          },
        });
      }

      if (selection && (selection.startLineNumber !== selection.endLineNumber || selection.startColumn !== selection.endColumn)) {
        newDecs.push({
          range: new monaco.Range(selection.startLineNumber, selection.startColumn, selection.endLineNumber, selection.endColumn),
          options: { className: `remote-selection-${socketId.replace(/[^a-zA-Z0-9]/g, "")}` },
        });
      }

      const safeId = socketId.replace(/[^a-zA-Z0-9]/g, "");
      let styleEl  = document.getElementById(`cursor-style-${safeId}`);
      if (!styleEl) {
        styleEl    = document.createElement("style");
        styleEl.id = `cursor-style-${safeId}`;
        document.head.appendChild(styleEl);
      }

      const badgeTop = isLineOne ? "18px" : "-18px";
      styleEl.innerHTML = `
        .remote-cursor-${safeId} {
          border-left: 2px solid ${color} !important;
          position: relative;
        }
        .remote-cursor-${safeId}::after {
          content: '${rName}';
          position: absolute;
          top: ${badgeTop};
          left: 0;
          background: ${color};
          color: #ffffff;
          font-size: 10px;
          font-weight: 600;
          padding: 1px 6px;
          border-radius: 4px;
          white-space: nowrap;
          pointer-events: none;
          z-index: 20;
          box-shadow: 0 2px 6px rgba(0,0,0,0.4);
          font-family: 'Inter', sans-serif;
        }
        .remote-selection-${safeId} {
          background-color: ${color}26 !important;
        }
      `;

      const oldDecs   = remoteDecorations.current.get(socketId) || [];
      const applied   = editorRef.current.deltaDecorations(oldDecs, newDecs);
      remoteDecorations.current.set(socketId, applied);
    });

    return () => {
      socket.off("connect",          handleConnect);
      socket.off("room-state");
      socket.off("user-joined");
      socket.off("user-left");
      socket.off("code-delta-update");
      socket.off("code-update");
      socket.off("language-update");
      socket.off("cursor-update");
      document.querySelectorAll("style[id^='cursor-style-']").forEach((el) => el.remove());
    };
  }, [socket, roomId, username, addToast]);

  /* ── Handlers ─────────────────────────────────────────── */
  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    const tmpl = DEFAULT_CODE[lang] || "";
    setCode(tmpl);
    socket?.emit("language-change", { roomId, language: lang });
    socket?.emit("code-change",     { roomId, code: tmpl });
  };

  const downloadCodeFile = () => {
    const langObj = LANGUAGES.find((l) => l.value === language);
    const ext     = langObj?.ext ?? "txt";
    const text    = editorRef.current ? editorRef.current.getValue() : code;
    const blob    = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url     = URL.createObjectURL(blob);
    const a       = document.createElement("a");
    a.href        = url;
    a.download    = `script.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    addToast(`Downloaded script.${ext}`);
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    addToast("Room ID copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const copyRoomLink = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast("Shareable link copied");
  };

  if (!username) return null;

  return (
    <div className="editor-page">
      {/* ── Topbar ──────────────────────────────────────── */}
      <header className="topbar">
        {/* Left: logo + room badge */}
        <div className="topbar-left">
          <div className="app-logo" onClick={() => navigate("/")} title="Back to home" role="button" tabIndex={0}>
            <div className="logo-mark" aria-hidden="true">
              <IconCode />
            </div>
            <span className="logo-text">CodeSinc</span>
          </div>

          <div className="topbar-sep" aria-hidden="true" />

          <div
            className="room-badge"
            onClick={copyRoomId}
            title="Click to copy Room ID"
            role="button"
            tabIndex={0}
            aria-label={`Room ID: ${roomId}. Click to copy.`}
          >
            <span className="room-badge-label">Room</span>
            <span className="room-badge-id">{roomId}</span>
            <span className="room-badge-icon">
              {copied ? <IconCheck /> : <IconCopy />}
            </span>
          </div>
        </div>

        {/* Center: language selector */}
        <div className="topbar-center">
          <div className="lang-selector-wrap">
            <span className="lang-select-icon" aria-hidden="true">
              <IconGlobe />
            </span>
            <select
              className="lang-select"
              value={language}
              onChange={handleLanguageChange}
              aria-label="Select language"
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
            <span className="lang-select-caret" aria-hidden="true">
              <IconChevronDown />
            </span>
          </div>
        </div>

        {/* Right: actions */}
        <div className="topbar-right">
          <button className="btn btn-ghost" onClick={downloadCodeFile} title="Download file">
            <IconDownload />
            Export
          </button>

          <button className="btn btn-ghost" onClick={copyRoomLink} title="Copy shareable link">
            <IconLink />
            Share
          </button>

          <button
            className={`btn btn-run${isRunning ? " running" : ""}`}
            onClick={runCode}
            disabled={isRunning}
            aria-label={isRunning ? "Running code…" : "Run code (Ctrl+Enter)"}
          >
            {isRunning ? (
              <>
                <span className="spinner" />
                Running…
              </>
            ) : (
              <>
                <IconRun />
                Run
              </>
            )}
          </button>
        </div>
      </header>

      {/* ── Editor layout ──────────────────────────────── */}
      <div className="editor-layout">
        {/* Sidebar */}
        <aside className="sidebar" aria-label="Collaborators panel">
          <UsersList users={users} currentSocketId={socket?.id} />

          <div className="sidebar-footer">
            <button
              className="btn btn-danger-ghost btn-block"
              onClick={() => navigate("/")}
              aria-label="Leave room"
            >
              <IconDoor />
              Leave Room
            </button>
          </div>
        </aside>

        {/* Main editor area */}
        <main className="editor-main">
          {/* Monaco editor */}
          <div className="editor-container">
            <Editor
              height="100%"
              language={language}
              value={code}
              onMount={handleEditorMount}
              theme="vs-dark"
              options={{
                fontSize:              14,
                fontFamily:            "'JetBrains Mono', 'Fira Code', monospace",
                fontLigatures:         true,
                minimap:               { enabled: false },
                scrollBeyondLastLine:  false,
                wordWrap:              "on",
                lineNumbers:           "on",
                smoothScrolling:       true,
                cursorBlinking:        "smooth",
                cursorSmoothCaretAnimation: "on",
                tabSize:               2,
                padding:               { top: 16, bottom: 16 },
                bracketPairColorization: { enabled: true },
                automaticLayout:       true,
                renderLineHighlight:   "gutter",
                scrollbar: {
                  verticalScrollbarSize:   6,
                  horizontalScrollbarSize: 6,
                },
                guides: {
                  bracketPairs: true,
                  indentation:  true,
                },
              }}
            />
          </div>

          {/* Output panel */}
          {showOutput && (
            <div className="output-container">
              <div className="output-resize-handle" aria-hidden="true" />
              <OutputPanel
                output={output}
                isRunning={isRunning}
                stdin={stdin}
                setStdin={setStdin}
                onClearOutput={() => setOutput(null)}
              />
              {/* Close output */}
              <button
                className="output-toggle-btn"
                style={{ bottom: "auto", top: 8, right: 8, padding: "4px 8px", fontSize: "0.6875rem" }}
                onClick={() => setShowOutput(false)}
                title="Collapse output panel"
                aria-label="Collapse output panel"
              >
                <IconChevronDown2 />
                Collapse
              </button>
            </div>
          )}

          {/* Expand output button (floating) */}
          {!showOutput && (
            <button
              className="output-toggle-btn"
              onClick={() => setShowOutput(true)}
              aria-label="Show output and stdin panel"
            >
              <IconChevronUp />
              Output &amp; Stdin
            </button>
          )}
        </main>
      </div>

      {/* ── Toast notifications ─────────────────────────── */}
      <div className="toast-container" aria-live="polite" aria-label="Notifications">
        {toasts.map((t) => (
          <div key={t.id} className="toast" role="status">
            {t.msg}
          </div>
        ))}
      </div>
    </div>
  );
}
