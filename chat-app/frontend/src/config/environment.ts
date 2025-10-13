// Configuration pour l'environnement de développement
export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001",
  wsUrl: process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:4001",
  environment: process.env.NODE_ENV || "development",
};
