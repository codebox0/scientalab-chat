/**
 * Session data
 * @description This interface is used to represent the session data.
 */
export interface SessionData {
  sessionId: string;
  username: string;
  timestamp: number;
}

const SESSION_KEY = "scienta-lab-session";

/**
 * Session storage service
 * @description This class is used to handle the session storage service.
 */
export class SessionStorageService {
  static saveSession(sessionId: string, username: string): void {
    const sessionData: SessionData = {
      sessionId,
      username,
      timestamp: Date.now(),
    };

    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
      console.log("✅ Session sauvegardée dans localStorage");
    } catch (error) {
      console.error("❌ Erreur lors de la sauvegarde de session:", error);
    }
  }

  /**
   * Get session
   * @description This method is used to get the session.
   */
  static getSession(): SessionData | null {
    try {
      const sessionData = localStorage.getItem(SESSION_KEY);
      if (!sessionData) {
        return null;
      }

      const parsed: SessionData = JSON.parse(sessionData);

      // Vérifier si la session n'est pas trop ancienne (24h)
      const maxAge = 24 * 60 * 60 * 1000; // 24 heures
      if (Date.now() - parsed.timestamp > maxAge) {
        console.log("⏰ Session expirée, suppression du localStorage");
        this.clearSession();
        return null;
      }

      console.log("✅ Session récupérée depuis localStorage:", parsed);
      return parsed;
    } catch (error) {
      console.error("❌ Erreur lors de la récupération de session:", error);
      this.clearSession();
      return null;
    }
  }

  /**
   * Clear session
   * @description This method is used to clear the session.
   */
  static clearSession(): void {
    try {
      localStorage.removeItem(SESSION_KEY);
      console.log("🗑️ Session supprimée du localStorage");
    } catch (error) {
      console.error("❌ Erreur lors de la suppression de session:", error);
    }
  }

  /**
   * Has valid session
   * @description This method is used to check if the session is valid.
   */
  static hasValidSession(): boolean {
    return this.getSession() !== null;
  }
}
