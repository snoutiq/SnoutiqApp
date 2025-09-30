// import { io } from "socket.io-client";

// // Development vs Production check
// const isDevelopment =
//   window.location.hostname === "localhost" ||
//   window.location.hostname === "127.0.0.1" ||
//   window.location.hostname === "0.0.0.0";

// const SOCKET_URLS = {
//   development: "http://localhost:4000",
//   production: window.location.origin, // https://snoutiq.com (Apache proxy karega)
// };

// const socketUrl = isDevelopment ? SOCKET_URLS.development : SOCKET_URLS.production;

// export const socket = io(socketUrl, {
//   path: "/socket.io/",
//   transports: ["websocket", "polling"],
//   reconnection: true,
//   reconnectionDelay: 1000,
//   reconnectionAttempts: 10,
//   timeout: 20000,
//   forceNew: true,
// });

// // Debug logs
// socket.on("connect", () => {
//   console.log("✅ Connected to server:", socket.id);
//   console.log("🌐 Connected to:", socketUrl);
// });

// socket.on("disconnect", (reason) => {
//   console.log("❌ Disconnected from server. Reason:", reason);
// });

// socket.on("connect_error", (error) => {
//   console.error("❌ Connection error:", error.message);
//   console.error("🔍 Trying to connect to:", socketUrl);
//   console.error("🛠️ Environment:", isDevelopment ? "Development" : "Production");
// });

// socket.on("reconnect", (attemptNumber) => {
//   console.log("🔄 Reconnected after", attemptNumber, "attempts");
// });

// socket.on("reconnect_attempt", (attemptNumber) => {
//   console.log("🔄 Reconnection attempt", attemptNumber);
// });

// socket.on("reconnect_error", (error) => {
//   console.error("❌ Reconnection failed:", error.message);
// });

// socket.on("reconnect_failed", () => {
//   console.error("❌ Failed to reconnect after maximum attempts");
// });

// export const getConnectionInfo = () => ({
//   url: socketUrl,
//   environment: isDevelopment ? "development" : "production",
//   connected: socket.connected,
//   id: socket.id,
// });

// import { io } from "socket.io-client";
// import { Platform } from "react-native";

// const isDevelopment = __DEV__;

// let socketUrl;

// if (__DEV__) {
//   if (Platform.OS === "android") {
//     socketUrl = "http://192.168.1.14:4000"; // <-- PC ka LAN IP
//   } else {
//     socketUrl = "http://localhost:4000";
//   }
// } else {
//   socketUrl = "https://snoutiq.com";
// }

// export const socket = io(socketUrl, {
//   path: "/socket.io/",
//   transports: ["websocket", "polling"],
//   reconnection: true,
//   reconnectionDelay: 1000,
//   reconnectionAttempts: 10,
//   timeout: 20000,
//   forceNew: false,
//   autoConnect: true,
// });

// // Enhanced connection event handlers
// socket.on("connect", () => {
//   console.log("✅ Connected to server:", socket.id);
//   console.log("🌐 Environment:", isDevelopment ? "development" : "production");

//   // Request server status on connect
//   socket.emit("get-server-status");
// });

// socket.on("disconnect", (reason) => {
//   console.log("❌ Disconnected. Reason:", reason);
//   if (reason === "io server disconnect") {
//     // Reconnection is required
//     socket.connect();
//   }
// });

// socket.on("connect_error", (error) => {
//   console.error("❌ Connection error:", error.message);
//   console.error("🔗 Trying to connect to:", socketUrl);
// });

// // Debug event listeners
// socket.on("server-status", (status) => {
//   console.log("📊 Server Status:", status);
// });

// socket.on("active-doctors", (doctors) => {
//   console.log("👨‍⚕️ Active doctors updated:", doctors);
// });

// export const getConnectionInfo = () => ({
//   url: socketUrl,
//   environment: isDevelopment ? "development" : "production",
//   connected: socket.connected,
//   id: socket.id,
//   transport: socket.io.engine?.transport?.name,
// });

// // Utility functions for socket operations
// export const socketUtils = {
//   // Check if socket is connected
//   isConnected: () => socket.connected,

//   // Manual connect/disconnect
//   connect: () => socket.connect(),
//   disconnect: () => socket.disconnect(),

//   // Emit with promise wrapper for better error handling
//   emitWithAck: (event, data, timeout = 10000) => {
//     return new Promise((resolve, reject) => {
//       const timer = setTimeout(() => {
//         reject(new Error(`Socket timeout for event: ${event}`));
//       }, timeout);

//       socket.emit(event, data, (response) => {
//         clearTimeout(timer);
//         resolve(response);
//       });
//     });
//   },
// };

import { Platform } from "react-native";
import { io } from "socket.io-client";

let socketUrl;

if (__DEV__) {
  // For both Android and iOS in development, use the same IP
  socketUrl = "http://192.168.1.7:4000";
} else {
  socketUrl = "https://snoutiq.com";
}

console.log("🔧 Socket URL:", socketUrl);

export const socket = io(socketUrl, {
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 5, // Reduce from Infinity
  reconnectionDelay: 2000,
  reconnectionDelayMax: 10000,
  timeout: 10000,
  autoConnect: true,
  forceNew: true,
});

// Enhanced error handling
socket.on("connect", () => {
  console.log("✅ Connected to server:", socket.id);
  console.log("📡 Transport:", socket.io.engine.transport.name);
});

socket.on("disconnect", (reason) => {
  console.log("❌ Disconnected. Reason:", reason);
});

socket.on("connect_error", (error) => {
  console.error("❌ Connection error:", error.message);
  console.error("🔧 Error details:", error);
});

socket.on("connect_timeout", (timeout) => {
  console.error("⏰ Connection timeout:", timeout);
});