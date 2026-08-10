import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import axios from "axios";
import { useSocket } from "../context/SocketContext";
import UsersList from "../components/UsersList";
import OutputPanel from "../components/OutputPanel";

const LANGUAGES = [
  { value: "javascript", label: "JavaScript (Node.js)", ext: "js" },
  { value: "python", label: "Python 3", ext: "py" },
  { value: "cpp", label: "C++ (GCC)", ext: "cpp" },
  { value: "c", label: "C (GCC)", ext: "c" },
  { value: "java", label: "Java (OpenJDK)", ext: "java" },
  { value: "go", label: "Go", ext: "go" },
  { value: "rust", label: "Rust", ext: "rs" },
  { value: "typescript", label: "TypeScript", ext: "ts" },
];

const DEFAULT_CODE = {
  javascript: `function solve() {\n  const greeting = "Hello from Real-Time Collaborative Editor!";\n  console.log(greeting);\n}\n\nsolve();\n`,
  python: `def main():\n    greeting = "Hello from Real-Time Collaborative Editor!"\n    print(greeting)\n\nif __name__ == "__main__":\n    main()\n`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello from Real-Time Collaborative Editor!" << endl;\n    return 0;\n}\n`,
  c: `#include <stdio.h>\n\nint main() {\n    printf("Hello from Real-Time Collaborative Editor!\\n");\n    return 0;\n}\n`,
  java: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Real-Time Collaborative Editor!");\n    }\n}\n`,
  go: `package main\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello from Real-Time Collaborative Editor!")\n}\n`,
  rust: `fn main() {\n    println!("Hello from Real-Time Collaborative Editor!");\n}\n`,
  typescript: `const greet = (msg: string): void => {\n  console.log(msg);\n};\n\ngreet("Hello from Real-Time Collaborative Editor!");\n`,
};

export default function EditorPage() {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { socket, backendUrl } = useSocket();

  const username = location.state?.username || localStorage.getItem("collabcode_username");

  const [code, setCode] = useState("// Loading workspace...\n");
  const [language, setLanguage] = useState("javascript");
  const [stdin, setStdin] = useState("");
  const [users, setUsers] = useState({});
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [showOutput, setShowOutput] = useState(false);

  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const remoteDecorations = useRef(new Map());
  const isRemoteUpdate = useRef(false);
  const runCodeRef = useRef();

  const addToast = useCallback((msg) => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);

  useEffect(() => {
    if (!username) {
      navigate("/", { replace: true });
    }
  }, [username, navigate]);

  const runCode = useCallback(async () => {
    if (isRunning) return;
    setIsRunning(true);
    setShowOutput(true);

    try {
      const executeEndpoint = `${backendUrl}/api/execute`;
      const { data } = await axios.post(executeEndpoint, {
        code,
        language,
        stdin,
      });
      setOutput(data);
    } catch (err) {
      setOutput({
        stderr: err.response?.data?.message || err.message || "Execution service unavailable.",
        stdout: "",
        compile_output: "",
        status: "Error",
      });
    } finally {
      setIsRunning(false);
    }
  }, [backendUrl, code, language, stdin, isRunning]);

  runCodeRef.current = runCode;

  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      runCodeRef.current();
    });

    editor.onDidChangeCursorPosition((e) => {
      if (socket && roomId) {
        const selection = editor.getSelection();
        socket.emit("cursor-move", {
          roomId,
          position: e.position,
          selection: {
            startLineNumber: selection.startLineNumber,
            startColumn: selection.startColumn,
            endLineNumber: selection.endLineNumber,
            endColumn: selection.endColumn,
          },
        });
      }
    });
  };

  useEffect(() => {
    if (!socket || !username) return;

    socket.emit("join-room", { roomId, username });

    socket.on("room-state", ({ code: roomCode, language: roomLang, users: roomUsers }) => {
      setCode(roomCode);
      setLanguage(roomLang);
      setUsers(roomUsers);
    });

    socket.on("user-joined", ({ username: name, users: updatedUsers }) => {
      setUsers(updatedUsers);
      addToast(`${name} joined the room`);
    });

    socket.on("user-left", ({ socketId, username: name, users: updatedUsers }) => {
      setUsers(updatedUsers);
      addToast(`${name} left the room`);

      if (editorRef.current && remoteDecorations.current.has(socketId)) {
        const oldDecs = remoteDecorations.current.get(socketId);
        editorRef.current.deltaDecorations(oldDecs, []);
        remoteDecorations.current.delete(socketId);
      }
    });

    socket.on("code-update", ({ code: newCode }) => {
      isRemoteUpdate.current = true;
      if (editorRef.current) {
        const position = editorRef.current.getPosition();
        setCode(newCode);
        setTimeout(() => {
          if (editorRef.current && position) {
            editorRef.current.setPosition(position);
          }
        }, 0);
      } else {
        setCode(newCode);
      }
    });

    socket.on("language-update", ({ language: newLang }) => {
      setLanguage(newLang);
    });

    socket.on("cursor-update", ({ socketId, username: rName, color, position, selection }) => {
      if (!editorRef.current || !monacoRef.current || socketId === socket.id) return;

      const monaco = monacoRef.current;
      const newDecorations = [];

      if (position) {
        newDecorations.push({
          range: new monaco.Range(
            position.lineNumber,
            position.column,
            position.lineNumber,
            position.column + 1
          ),
          options: {
            className: `remote-cursor-${socketId.replace(/[^a-zA-Z0-9]/g, "")}`,
            beforeContentClassName: `remote-cursor-line`,
            hoverMessage: { value: `**${rName}** is here` },
          },
        });
      }

      if (
        selection &&
        (selection.startLineNumber !== selection.endLineNumber ||
          selection.startColumn !== selection.endColumn)
      ) {
        newDecorations.push({
          range: new monaco.Range(
            selection.startLineNumber,
            selection.startColumn,
            selection.endLineNumber,
            selection.endColumn
          ),
          options: {
            className: `remote-selection-${socketId.replace(/[^a-zA-Z0-9]/g, "")}`,
          },
        });
      }

      const safeId = socketId.replace(/[^a-zA-Z0-9]/g, "");
      let styleEl = document.getElementById(`cursor-style-${safeId}`);
      if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = `cursor-style-${safeId}`;
        document.head.appendChild(styleEl);
      }
      styleEl.innerHTML = `
        .remote-cursor-${safeId} {
          border-left: 2px solid ${color} !important;
          position: relative;
        }
        .remote-cursor-${safeId}::after {
          content: '${rName}';
          position: absolute;
          top: -18px;
          left: 0;
          background: ${color};
          color: #ffffff;
          font-size: 10px;
          font-weight: 600;
          padding: 1px 4px;
          border-radius: 3px;
          white-space: nowrap;
          pointer-events: none;
          z-index: 10;
        }
        .remote-selection-${safeId} {
          background-color: ${color}33 !important;
        }
      `;

      const oldDecs = remoteDecorations.current.get(socketId) || [];
      const appliedDecs = editorRef.current.deltaDecorations(oldDecs, newDecorations);
      remoteDecorations.current.set(socketId, appliedDecs);
    });

    return () => {
      socket.off("room-state");
      socket.off("user-joined");
      socket.off("user-left");
      socket.off("code-update");
      socket.off("language-update");
      socket.off("cursor-update");
    };
  }, [socket, roomId, username, addToast]);

  const handleCodeChange = (value) => {
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }
    setCode(value);
    socket?.emit("code-change", { roomId, code: value });
  };

  const handleLanguageChange = (e) => {
    const selectedLang = e.target.value;
    setLanguage(selectedLang);
    const newTemplate = DEFAULT_CODE[selectedLang] || "";
    setCode(newTemplate);

    socket?.emit("language-change", { roomId, language: selectedLang });
    socket?.emit("code-change", { roomId, code: newTemplate });
  };

  const downloadCodeFile = () => {
    const currentLangObj = LANGUAGES.find((l) => l.value === language);
    const ext = currentLangObj ? currentLangObj.ext : "txt";
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `script.${ext}`;
    link.click();
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
      <header className="topbar">
        <div className="topbar-left">
          <div className="app-logo" onClick={() => navigate("/")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            <span>CollabCode</span>
          </div>

          <div className="room-badge" onClick={copyRoomId} title="Click to copy Room ID">
            <span className="room-label">ROOM</span>
            <span className="room-id">{roomId}</span>
            <span className="copy-icon">
              {copied ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
            </span>
          </div>
        </div>

        <div className="topbar-center">
          <div className="language-selector-wrapper">
            <select className="lang-select" value={language} onChange={handleLanguageChange}>
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="topbar-right">
          <button className="btn btn-ghost" onClick={downloadCodeFile} title="Download File">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export
          </button>

          <button className="btn btn-ghost" onClick={copyRoomLink}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            Share Link
          </button>

          <button
            className={`btn btn-run ${isRunning ? "running" : ""}`}
            onClick={runCode}
            disabled={isRunning}
          >
            {isRunning ? (
              <>
                <span className="spinner" /> Compiling...
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Run
              </>
            )}
          </button>
        </div>
      </header>

      <div className="editor-layout">
        <aside className="sidebar">
          <UsersList users={users} currentSocketId={socket?.id} />

          <div className="sidebar-footer">
            <button className="btn btn-danger-ghost btn-block" onClick={() => navigate("/")}>
              Leave Room
            </button>
          </div>
        </aside>

        <main className="editor-main">
          <div className={`editor-container ${showOutput ? "with-output" : ""}`}>
            <Editor
              height="100%"
              language={language === "cpp" ? "cpp" : language}
              value={code}
              onChange={handleCodeChange}
              onMount={handleEditorMount}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: "on",
                lineNumbers: "on",
                smoothScrolling: true,
                cursorBlinking: "smooth",
                tabSize: 2,
                padding: { top: 12, bottom: 12 },
                bracketPairColorization: { enabled: true },
                automaticLayout: true,
              }}
            />
          </div>

          {showOutput && (
            <div className="output-container">
              <button
                className="close-output-btn"
                onClick={() => setShowOutput(false)}
                title="Collapse Output"
              >
                ✕
              </button>
              <OutputPanel
                output={output}
                isRunning={isRunning}
                stdin={stdin}
                setStdin={setStdin}
                onClearOutput={() => setOutput(null)}
              />
            </div>
          )}

          {!showOutput && (
            <button className="expand-output-btn" onClick={() => setShowOutput(true)}>
              Show Output & Stdin
            </button>
          )}
        </main>
      </div>

      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            {t.msg}
          </div>
        ))}
      </div>
    </div>
  );
}
