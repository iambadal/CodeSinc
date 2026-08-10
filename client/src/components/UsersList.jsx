export default function UsersList({ users = {}, currentSocketId }) {
  const userEntries = Object.entries(users);

  const getInitials = (name = "") => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return (name[0] || "?").toUpperCase();
  };

  return (
    <div className="users-panel">
      <div className="users-header">
        <span className="users-title">Active Collaborators</span>
        <span className="users-badge">{userEntries.length}</span>
      </div>

      <div className="users-list">
        {userEntries.map(([id, { username, color }]) => {
          const isSelf = id === currentSocketId;
          const initials = getInitials(username);

          return (
            <div key={id} className={`user-item ${isSelf ? "is-self" : ""}`}>
              <div className="user-avatar" style={{ backgroundColor: color }}>
                {initials}
                <span className="online-indicator" />
              </div>
              <div className="user-info">
                <span className="user-name">
                  {username}
                  {isSelf && <span className="you-tag">You</span>}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
