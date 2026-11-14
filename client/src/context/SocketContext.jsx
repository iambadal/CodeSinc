import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

const getBackendUrl = () => {
  const configuredUrl = import.meta.env.VITE_SERVER_URL;

  if (configuredUrl) {
    return configuredUrl;
  }

  const isLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  return isLocal
    ? "http://localhost:5001"
    : "https://collab-code-editor-mvie.onrender.com";
};

export function SocketProvider({ children }) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  const backendUrl = getBackendUrl();

  useEffect(() => {
    socketRef.current = io(backendUrl, {
      reconnectionAttempts: 5,
    });

    socketRef.current.on("connect", () => setConnected(true));
    socketRef.current.on("disconnect", () => setConnected(false));

    return () => socketRef.current?.disconnect();
  }, [backendUrl]);

  return (
    <SocketContext.Provider
      value={{ socket: socketRef.current, connected, backendUrl }}
    >
      {children}
    </SocketContext.Provider>
  );
}
