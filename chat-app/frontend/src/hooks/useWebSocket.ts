"use client";

import { config } from "@/config/environment";
import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

interface WebSocketMessage {
  id: string;
  content: string;
  role: "user" | "assistant" | "system";
  timestamp: string;
  sessionId: string;
  metadata?: unknown;
  queryAnalysis?: unknown;
  biomedicalData?: unknown[];
}

/**
 * Use WebSocket return
 * @description This interface is used to represent the return of the useWebSocket hook.
 */
interface UseWebSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  sendMessage: (content: string, userId?: string, title?: string) => void;
  joinSession: (sessionId: string) => void;
  leaveSession: (sessionId: string) => void;
  onMessage: (callback: (message: WebSocketMessage) => void) => () => void;
  onTyping: (callback: (isTyping: boolean) => void) => () => void;
  onError: (callback: (error: string) => void) => () => void;
  sendTyping: (isTyping: boolean) => void;
}

/**
 * Use WebSocket hook
 * @description This hook is used to handle the WebSocket connection.
 */
export const useWebSocket = (sessionId?: string): UseWebSocketReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const messageCallbacks = useRef<((message: WebSocketMessage) => void)[]>([]);
  const typingCallbacks = useRef<((isTyping: boolean) => void)[]>([]);
  const errorCallbacks = useRef<((error: string) => void)[]>([]);

  // Initialize socket connection.
  useEffect(() => {
    const wsUrl = config.wsUrl || "ws://localhost:4001";
    console.log(`🔌 Connecting to WebSocket: ${wsUrl}/chat`);

    const newSocket = io(`${wsUrl}/chat`, {
      transports: ["websocket", "polling"],
      timeout: 20000,
      forceNew: true,
    });

    // Connection events.
    newSocket.on("connect", () => {
      console.log("✅ WebSocket connected:", newSocket.id);
      setIsConnected(true);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("❌ WebSocket disconnected:", reason);
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("❌ WebSocket connection error:", error);
      setIsConnected(false);
    });

    // Session events.
    newSocket.on("session-joined", (data) => {
      console.log("📝 Joined session:", data.sessionId);
    });

    newSocket.on("user-joined", (data) => {
      console.log("👤 User joined:", data.clientId);
    });

    newSocket.on("user-left", (data) => {
      console.log("👋 User left:", data.clientId);
    });

    // Message events.
    newSocket.on("new-message", (message: WebSocketMessage) => {
      console.log("📨 New message received:", message.id);
      messageCallbacks.current.forEach((callback) => callback(message));
    });

    // Typing events
    newSocket.on("typing", (data) => {
      console.log("⌨️ Typing:", data.isTyping);
      typingCallbacks.current.forEach((callback) => callback(data.isTyping));
    });

    // Error events
    newSocket.on("error", (error) => {
      console.error("❌ WebSocket error:", error);
      errorCallbacks.current.forEach((callback) => callback(error.message));
    });

    setSocket(newSocket);

    return () => {
      console.log("🔌 Disconnecting WebSocket");
      newSocket.close();
    };
  }, []);

  // Join session
  const joinSession = useCallback(
    (sessionId: string) => {
      if (socket && isConnected) {
        console.log(`🔗 Joining session: ${sessionId}`);
        socket.emit("join-session", { sessionId });
      }
    },
    [socket, isConnected]
  );

  // Leave session
  const leaveSession = useCallback(
    (sessionId: string) => {
      if (socket && isConnected) {
        console.log(`🔗 Leaving session: ${sessionId}`);
        socket.emit("leave-session", { sessionId });
      }
    },
    [socket, isConnected]
  );

  // Send message
  const sendMessage = useCallback(
    (content: string, userId?: string, title?: string) => {
      if (socket && isConnected && sessionId) {
        console.log(
          `📤 Sending message to session ${sessionId}:`,
          content.substring(0, 50)
        );
        socket.emit("send-message", {
          sessionId,
          content,
          userId,
          title,
        });
      } else {
        console.warn(
          "⚠️ Cannot send message: socket not connected or no session"
        );
      }
    },
    [socket, isConnected, sessionId]
  );

  // Send typing indicator
  const sendTyping = useCallback(
    (isTyping: boolean) => {
      if (socket && isConnected && sessionId) {
        socket.emit("typing", { sessionId, isTyping });
      }
    },
    [socket, isConnected, sessionId]
  );

  // Event listeners
  const onMessage = useCallback(
    (callback: (message: WebSocketMessage) => void) => {
      messageCallbacks.current.push(callback);
      return () => {
        const index = messageCallbacks.current.indexOf(callback);
        if (index > -1) {
          messageCallbacks.current.splice(index, 1);
        }
      };
    },
    []
  );

  const onTyping = useCallback((callback: (isTyping: boolean) => void) => {
    typingCallbacks.current.push(callback);
    return () => {
      const index = typingCallbacks.current.indexOf(callback);
      if (index > -1) {
        typingCallbacks.current.splice(index, 1);
      }
    };
  }, []);

  const onError = useCallback((callback: (error: string) => void) => {
    errorCallbacks.current.push(callback);
    return () => {
      const index = errorCallbacks.current.indexOf(callback);
      if (index > -1) {
        errorCallbacks.current.splice(index, 1);
      }
    };
  }, []);

  // Auto-join session when sessionId changes
  useEffect(() => {
    if (sessionId && socket && isConnected) {
      joinSession(sessionId);
    }
  }, [sessionId, socket, isConnected, joinSession]);

  return {
    socket,
    isConnected,
    sendMessage,
    joinSession,
    leaveSession,
    onMessage,
    onTyping,
    onError,
    sendTyping,
  };
};
