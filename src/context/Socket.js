import { io } from "socket.io-client";

const SOCKET_URL = __DEV__
  ? "http://10.191.5.171:4000" 
  : "https://snoutiq.com";  

// -------------------- SOCKET.IO CLIENT --------------------
export const socket = io(SOCKET_URL, {
  path: "/socket.io/",
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 10,
  timeout: 20000,
  forceNew: true,
});

// -------------------- SOCKET EVENTS --------------------
// Successfully connected
socket.on("connect", () => {
  console.log("✅ Socket connected:", socket.id);
  console.log("🌐 Connected to:", SOCKET_URL);
});

// Disconnected
socket.on("disconnect", (reason) => {
  console.log("❌ Socket disconnected. Reason:", reason);
});

// Connection error
socket.on("connect_error", (error) => {
  console.error("❌ Connection error:", error.message);
  console.error("🔍 Trying to connect to:", SOCKET_URL);
  console.error("🛠️ Environment:", __DEV__ ? "Development" : "Production");
});

// Reconnection attempts
socket.on("reconnect_attempt", (attemptNumber) => {
  console.log("🔄 Reconnection attempt", attemptNumber);
});

// Successfully reconnected
socket.on("reconnect", (attemptNumber) => {
  console.log("🔄 Reconnected after", attemptNumber, "attempts");
});

// Reconnection failed
socket.on("reconnect_failed", () => {
  console.error("❌ Failed to reconnect after max attempts");
});

// Helper to get connection info
export const getConnectionInfo = () => ({
  url: SOCKET_URL,
  environment: __DEV__ ? "development" : "production",
  connected: socket.connected,
  id: socket.id,
});
