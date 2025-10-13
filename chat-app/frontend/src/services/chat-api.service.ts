import { config } from "@/config/environment";
import { MessageRole } from "@/store/Message";

/**
 * Chat session
 * @description This interface is used to represent the chat session.
 */
export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
  context?: {
    biomedicalFocus?: string[];
    researchInterests?: string[];
    currentQuery?: string;
  };
}

/**
 * Message
 * @description This interface is used to represent the message.
 */
export interface Message {
  id: string;
  content: string;
  role: MessageRole;
  timestamp: string;
  sessionId: string;
  metadata?: {
    biomedicalData?: unknown;
    sources?: string[];
    confidence?: number;
    queryAnalysis?: unknown;
  };
}

/**
 * Create session request
 * @description This interface is used to represent the create session request.
 */
export interface CreateSessionRequest {
  userId: string;
  title: string;
}

/**
 * Send message request
 * @description This interface is used to represent the send message request.
 */
export interface SendMessageRequest {
  content: string;
}

/**
 * Chat API service
 * @description This class is used to handle the chat API service.
 */
class ChatApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.apiUrl;
  }

  /**
   * Create session
   * @description This method is used to create a session.
   */
  async createSession(userId: string, title: string): Promise<ChatSession> {
    try {
      console.log(`🔄 Tentative de connexion au backend: ${this.baseUrl}`);

      const response = await fetch(`${this.baseUrl}/chat/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, title }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Erreur HTTP ${response.status}:`, errorText);
        throw new Error(
          `Failed to create session: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();
      console.log(`✅ Session créée avec succès:`, result.id);
      return result;
    } catch (error) {
      console.error(`❌ Erreur de connexion au backend:`, error);
      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        throw new Error(
          `Impossible de se connecter au backend sur ${this.baseUrl}. Vérifiez que le serveur est démarré.`
        );
      }
      throw error;
    }
  }

  /**
   * Get session
   * @description This method is used to get a session.
   */
  async getSession(sessionId: string): Promise<ChatSession | null> {
    const response = await fetch(`${this.baseUrl}/chat/sessions/${sessionId}`);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to get session: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Send message
   * @description This method is used to send a message.
   */
  async sendMessage(sessionId: string, content: string): Promise<Message> {
    const response = await fetch(
      `${this.baseUrl}/chat/sessions/${sessionId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.statusText}`);
    }

    const result = await response.json();
    // Extract the message from the response structure
    return result.message;
  }

  /**
   * Get session messages
   * @description This method is used to get the messages of a session.
   */
  async getSessionMessages(
    sessionId: string,
    limit?: number
  ): Promise<Message[]> {
    const url = new URL(`${this.baseUrl}/chat/sessions/${sessionId}/messages`);
    if (limit) {
      url.searchParams.append("limit", limit.toString());
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Failed to get messages: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Validate session
   * @description This method is used to validate a session.
   */
  async validateSession(sessionId: string): Promise<{
    isValid: boolean;
    sessionId: string;
    conversation?: {
      id: string;
      userId: string;
      title: string;
      createdAt: string;
      updatedAt: string;
    };
  }> {
    console.log(`🌐 Validation de session: ${sessionId}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 secondes timeout

    try {
      const response = await fetch(
        `${this.baseUrl}/chat/sessions/${sessionId}/validate`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(
          `❌ Erreur validation session: ${response.status} ${response.statusText}`
        );
        throw new Error(`Failed to validate session: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`✅ Validation session réussie:`, result);
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        console.error(`⏰ Timeout validation session: ${sessionId}`);
        throw new Error("Session validation timeout");
      }
      throw error;
    }
  }

  /**
   * Delete session
   * @description This method is used to delete a session.
   */
  async deleteSession(
    sessionId: string
  ): Promise<{ success: boolean; sessionId: string }> {
    const response = await fetch(`${this.baseUrl}/chat/sessions/${sessionId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete session: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Search messages
   * @description This method is used to search messages.
   */
  async searchMessages(
    sessionId: string,
    query: string,
    limit?: number
  ): Promise<{
    messages: Message[];
    totalCount: number;
    query: string;
    sessionId: string;
  }> {
    const url = new URL(`${this.baseUrl}/chat/sessions/${sessionId}/search`);
    url.searchParams.append("query", query);
    if (limit) {
      url.searchParams.append("limit", limit.toString());
    }

    console.log(`🔍 Recherche URL: ${url.toString()}`);

    const response = await fetch(url.toString());

    if (!response.ok) {
      console.error(
        `❌ Erreur recherche: ${response.status} ${response.statusText}`
      );
      const errorText = await response.text();
      console.error(`❌ Détails: ${errorText}`);
      throw new Error(
        `Failed to search messages: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  /**
   * Search conversations
   * @description This method is used to search conversations.
   */
  async searchConversations(
    userId: string,
    query: string,
    limit?: number
  ): Promise<{
    conversations: ChatSession[];
    totalCount: number;
    query: string;
    userId: string;
  }> {
    const url = new URL(`${this.baseUrl}/chat/conversations/search`);
    url.searchParams.append("userId", userId);
    url.searchParams.append("query", query);
    if (limit) {
      url.searchParams.append("limit", limit.toString());
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Failed to search conversations: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Export conversation PDF
   * @description This method is used to export a conversation to a PDF.
   */
  async exportConversationPDF(
    sessionId: string,
    includeMetadata: boolean = true,
    format: "A4" | "Letter" = "A4"
  ): Promise<Blob> {
    const url = new URL(
      `${this.baseUrl}/chat/sessions/${sessionId}/export/pdf`
    );
    url.searchParams.append("includeMetadata", includeMetadata.toString());
    url.searchParams.append("format", format);

    console.log(`📄 Export PDF URL: ${url.toString()}`);
    console.log(`📄 Session ID pour export: ${sessionId}`);

    const response = await fetch(url.toString());

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `❌ Erreur export PDF: ${response.status} ${response.statusText}`
      );
      console.error(`❌ Détails: ${errorText}`);
      throw new Error(
        `Failed to export PDF: ${response.status} ${response.statusText}`
      );
    }

    const blob = await response.blob();
    console.log(`📄 Blob reçu - Taille: ${blob.size} bytes`);
    return blob;
  }
}

export const chatApiService = new ChatApiService();
