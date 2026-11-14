import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

/* ── SVG icons inline (no extra deps) ───────────────────── */
const IconCode = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);
const IconUser = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const IconHash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="9" x2="20" y2="9" />
    <line x1="4" y1="15" x2="20" y2="15" />
    <line x1="10" y1="3" x2="8" y2="21" />
    <line x1="16" y1="3" x2="14" y2="21" />
  </svg>
);
const IconArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);
const IconPlus = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const IconAlert = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export default function Home() {
  const [roomId, setRoomId]     = useState("");
  const [username, setUsername] = useState("");
  const [error, setError]       = useState("");
  const navigate                = useNavigate();

  /* Restore saved username */
  useEffect(() => {
    const saved = localStorage.getItem("collabcode_username");
    if (saved) setUsername(saved);
  }, []);

  const saveAndNavigate = (id) => {
    const trimmed = username.trim();
    localStorage.setItem("collabcode_username", trimmed);
    navigate(`/editor/${id}`, { state: { username: trimmed } });
  };

  const createRoom = () => {
    if (!username.trim()) { setError("Please enter your display name first"); return; }
    saveAndNavigate(uuidv4().slice(0, 8));
  };

  const joinRoom = (e) => {
    e.preventDefault();
    if (!username.trim()) { setError("Please enter your display name"); return; }
    if (!roomId.trim())   { setError("Please enter or generate a Room ID"); return; }
    saveAndNavigate(roomId.trim());
  };

  const generateQuickRoom = () => {
    setRoomId(uuidv4().slice(0, 8));
    setError("");
  };

  return (
    <div className="home-container">
      {/* Background elements */}
      <div className="home-bg-glow" aria-hidden="true" />
      <div className="home-grid"    aria-hidden="true" />

      {/* Card */}
      <div className="home-card" role="main">
        {/* Brand */}
        <div className="brand-header">
          <div className="brand-logo-wrap" aria-hidden="true">
            <IconCode />
          </div>
          <h1>CodeSinc</h1>
          <p className="brand-tagline">
            Real-time collaborative code editor &amp; execution workspace
          </p>
        </div>

        {/* Form */}
        <form onSubmit={joinRoom} className="join-form" noValidate>
          {/* Display Name */}
          <div className="input-group">
            <label htmlFor="username-input">Display Name</label>
            <div className="input-wrap">
              <span className="input-icon"><IconUser /></span>
              <input
                id="username-input"
                type="text"
                placeholder="e.g. Alex Rivera"
                value={username}
                autoFocus
                autoComplete="nickname"
                onChange={(e) => { setUsername(e.target.value); setError(""); }}
              />
            </div>
          </div>

          {/* Room ID */}
          <div className="input-group input-mono">
            <div className="label-row">
              <label htmlFor="room-input">Room ID</label>
              <button type="button" className="text-btn" onClick={generateQuickRoom}>
                Generate random
              </button>
            </div>
            <div className="input-wrap">
              <span className="input-icon"><IconHash /></span>
              <input
                id="room-input"
                type="text"
                placeholder="Paste existing or generate one"
                value={roomId}
                autoComplete="off"
                spellCheck="false"
                onChange={(e) => { setRoomId(e.target.value); setError(""); }}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="error-banner" role="alert">
              <IconAlert />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-block">
              Join Room <IconArrowRight />
            </button>

            <div className="form-divider">or</div>

            <button type="button" className="btn btn-secondary btn-block" onClick={createRoom}>
              <IconPlus />
              Create New Room
            </button>
          </div>
        </form>

        {/* Feature pills */}
        <div className="features-footer" aria-label="Powered by">
          <span className="feature-pill">
            <span className="pill-dot" />
            Socket.io Sync
          </span>
          <span className="feature-pill">
            <span className="pill-dot" />
            Judge0 Execution
          </span>
          <span className="feature-pill">
            <span className="pill-dot" />
            Monaco Engine
          </span>
        </div>
      </div>
    </div>
  );
}
