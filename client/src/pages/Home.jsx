import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

export default function Home() {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const savedName = localStorage.getItem("collabcode_username");
    if (savedName) setUsername(savedName);
  }, []);

  const saveUserAndNavigate = (id) => {
    const trimmedName = username.trim();
    localStorage.setItem("collabcode_username", trimmedName);
    navigate(`/editor/${id}`, { state: { username: trimmedName } });
  };

  const createRoom = () => {
    if (!username.trim()) {
      setError("Please enter your display name");
      return;
    }
    const id = uuidv4().slice(0, 8);
    saveUserAndNavigate(id);
  };

  const joinRoom = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError("Please enter your display name");
      return;
    }
    if (!roomId.trim()) {
      setError("Please enter or generate a Room ID");
      return;
    }
    saveUserAndNavigate(roomId.trim());
  };

  const generateQuickRoom = () => {
    const id = uuidv4().slice(0, 8);
    setRoomId(id);
    setError("");
  };

  return (
    <div className="home-container">
      <div className="home-background-gradient" />
      <div className="home-card">
        <div className="brand-header">
          <div className="brand-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
          </div>
          <h1>CollabCode</h1>
          <p className="brand-subtitle">Real-time collaborative code editor & execution workspace</p>
        </div>

        <form onSubmit={joinRoom} className="join-form">
          <div className="input-group">
            <label htmlFor="username-input">Your Display Name</label>
            <input
              id="username-input"
              type="text"
              placeholder="e.g. Alex Rivera"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError("");
              }}
              autoFocus
            />
          </div>

          <div className="input-group">
            <div className="label-row">
              <label htmlFor="room-input">Room ID</label>
              <button type="button" className="text-btn" onClick={generateQuickRoom}>
                Generate Random
              </button>
            </div>
            <input
              id="room-input"
              type="text"
              placeholder="Paste existing room ID or generate one"
              value={roomId}
              onChange={(e) => {
                setRoomId(e.target.value);
                setError("");
              }}
            />
          </div>

          {error && <div className="error-banner">{error}</div>}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-block">
              Join Room
            </button>
            <button type="button" className="btn btn-secondary btn-block" onClick={createRoom}>
              + Create New Room
            </button>
          </div>
        </form>

        <div className="features-footer">
          <div className="feature-pill">Socket.io Sync</div>
          <div className="feature-pill">Judge0 Execution</div>
          <div className="feature-pill">Monaco Engine</div>
        </div>
      </div>
    </div>
  );
}
