import { chatApiService } from "@/services/chat-api.service";
import {
  SessionData,
  SessionStorageService,
} from "@/services/session-storage.service";
import { useEffect, useState } from "react";

/**
 * Use Session hook
 * @description This hook is used to handle the session.
 */
export const useSession = () => {
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      console.log("🔄 Début de la vérification de session...");
      const session = SessionStorageService.getSession();

      if (!session) {
        console.log("❌ Aucune session trouvée dans localStorage");
        setIsLoading(false);
        return;
      }

      console.log(`🔍 Session trouvée dans localStorage:`, {
        sessionId: session.sessionId,
        username: session.username,
        timestamp: new Date(session.timestamp).toLocaleString(),
      });

      try {
        console.log(
          `🌐 Validation de la session côté serveur: ${session.sessionId}`
        );
        const validationResult = await chatApiService.validateSession(
          session.sessionId
        );

        console.log(`📊 Résultat de validation:`, validationResult);

        if (!validationResult.isValid) {
          console.log(
            `❌ Session ${session.sessionId} invalide côté serveur - déconnexion automatique`
          );
          SessionStorageService.clearSession();
          setSessionData(null);
        } else {
          console.log(`✅ Session ${session.sessionId} valide côté serveur`);
          setSessionData(session);
        }
      } catch (error) {
        console.error("❌ Erreur lors de la validation de session:", error);

        if (error instanceof Error) {
          if (error.message.includes("timeout")) {
            console.log(
              "⏰ Timeout de validation - conservation de la session locale"
            );
          } else if (error.message.includes("Failed to fetch")) {
            console.log(
              "🌐 Serveur indisponible - conservation de la session locale"
            );
          } else {
            console.log(
              "🔧 Erreur inconnue - conservation de la session locale"
            );
          }
        }

        console.log("🔄 Fallback: conservation de la session locale");
        // En cas d'erreur réseau, on garde la session locale.
        setSessionData(session);
      }

      console.log("✅ Vérification de session terminée");
      setIsLoading(false);
    };

    checkSession();
  }, []);

  /**
   * Save session
   * @description This method is used to save the session.
   */
  const saveSession = (sessionId: string, username: string) => {
    const newSessionData = { sessionId, username, timestamp: Date.now() };
    SessionStorageService.saveSession(sessionId, username);
    setSessionData(newSessionData);
  };

  /**
   * Clear session
   * @description This method is used to clear the session.
   */
  const clearSession = () => {
    SessionStorageService.clearSession();
    setSessionData(null);
  };

  return {
    sessionData,
    isLoading,
    saveSession,
    clearSession,
    isLoggedIn: !!sessionData,
  };
};
