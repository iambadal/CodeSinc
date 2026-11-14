export default function UsersList({ users = {}, currentSocketId }) {
  const userEntries = Object.entries(users);

  const getInitials = (name = "") => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return (name[0] || "?").toUpperCase();
  };

  return (
    <div className="users-panel">
      <div className="users-panel-header">
        <span className="users-panel-title">Collaborators</span>
        <span className="users-count-badge">{userEntries.length}</span>
      </div>

      <div className="users-list" role="list">
        {userEntries.length === 0 && (
          <div style={{
            padding: "24px 12px",
            textAlign: "center",
            color: "var(--text-disabled)",
            fontSize: "0.75rem",
            lineHeight: 1.5,
          }}>
            Waiting for<br />collaborators…
          </div>
        )}
        {userEntries.map(([id, { username, color }]) => {
          const isSelf    = id === currentSocketId;
          const initials  = getInitials(username);

          return (
            <div
              key={id}
              className={`user-item${isSelf ? " is-self" : ""}`}
              role="listitem"
              title={isSelf ? `${username} (you)` : username}
            >
              <div
                className="user-avatar"
                style={{ backgroundColor: color }}
                aria-hidden="true"
              >
                {initials}
                <span className="online-dot" />
              </div>

              <div className="user-info">
                <span className="user-name">
                  {username}
                  {isSelf && <span className="you-tag">You</span>}
                </span>
                <span className="user-status">Active</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
