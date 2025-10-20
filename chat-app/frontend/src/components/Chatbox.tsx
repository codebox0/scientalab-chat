"use client";

import { useWebSocket } from "@/hooks/useWebSocket";
import { chatApiService, Message } from "@/services/chat-api.service";
import { IMessage, MessageRole } from "@/store/Message";
import { useEffect, useRef, useState } from "react";
import Header from "./Header";
import MessageBubble from "./MessageBubble";
import MessageInputBar from "./MessageInputBar";

// Fonction pour convertir Message en IMessage
const convertMessageToIMessage = (message: Message): IMessage => ({
  id: message.id,
  content: message.content,
  role: message.role,
  timestamp: message.timestamp,
  sessionId: message.sessionId,
  metadata: message.metadata
    ? {
        biomedicalData: Array.isArray(message.metadata.biomedicalData)
          ? (message.metadata.biomedicalData as Record<string, unknown>[])
          : undefined,
        sources: message.metadata.sources,
        confidence: message.metadata.confidence,
        queryAnalysis: message.metadata.queryAnalysis
          ? (message.metadata.queryAnalysis as Record<string, unknown>)
          : undefined,
      }
    : undefined,
});

interface ChatboxProps {
  sessionId: string;
  username: string;
  onLogout: () => void;
}

const Chatbox = ({ sessionId, username, onLogout }: ChatboxProps) => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [input, setInput] = useState<string>("");
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(true);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isExportingPDF, setIsExportingPDF] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // WebSocket connection
  const { isConnected, sendMessage, onMessage, onTyping, onError } =
    useWebSocket(sessionId);

  // Charger les messages existants de la session au démarrage
  useEffect(() => {
    const loadExistingMessages = async () => {
      try {
        console.log(
          `🔄 Chargement des messages existants pour la session: ${sessionId}`
        );
        const existingMessages = await chatApiService.getSessionMessages(
          sessionId
        );
        setMessages(existingMessages.map(convertMessageToIMessage));
      } catch (err) {
        console.error("Failed to load existing messages:", err);
        setError("Failed to load chat history.");
      } finally {
        setIsLoadingMessages(false);
      }
    };

    loadExistingMessages();
  }, [sessionId]);

  // Scroll to the bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // WebSocket event listeners
  useEffect(() => {
    const unsubscribeMessage = onMessage((wsMessage) => {
      console.log("📨 WebSocket message received:", wsMessage.id);

      const newMessage: IMessage = {
        id: wsMessage.id,
        content: wsMessage.content,
        role: wsMessage.role as MessageRole,
        timestamp: wsMessage.timestamp,
        sessionId: wsMessage.sessionId,
        metadata: {
          ...(wsMessage.metadata && typeof wsMessage.metadata === "object"
            ? wsMessage.metadata
            : {}),
          queryAnalysis: wsMessage.queryAnalysis as
            | Record<string, unknown>
            | undefined,
          biomedicalData: Array.isArray(wsMessage.biomedicalData)
            ? (wsMessage.biomedicalData as Record<string, unknown>[])
            : undefined,
        },
      };

      setMessages((prev) => [...prev, newMessage]);
      setIsLoading(false);
    });

    const unsubscribeTyping = onTyping((typing) => {
      setIsTyping(typing);
    });

    const unsubscribeError = onError((error) => {
      setError(error);
      setIsLoading(false);
    });

    return () => {
      unsubscribeMessage();
      unsubscribeTyping();
      unsubscribeError();
    };
  }, [onMessage, onTyping, onError]);

  const handleSendMessage = async (messageText?: string) => {
    const messageToSend = messageText || input;
    if (!messageToSend.trim()) return;

    setIsLoading(true);
    setError("");

    // Add the user message immediately
    const userMessage: IMessage = {
      id: crypto.randomUUID(),
      content: messageToSend,
      role: MessageRole.USER,
      timestamp: new Date().toISOString(),
      sessionId,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      if (isConnected) {
        // Use WebSocket for real-time communication
        console.log("📤 Sending message via WebSocket");
        sendMessage(messageToSend, username, `Session de ${username}`);
      } else {
        // Fallback to HTTP API
        console.log("📤 Sending message via HTTP API (fallback)");
        const response = await chatApiService.sendMessage(
          sessionId,
          messageToSend
        );

        // Add the assistant response
        const assistantMessage: IMessage = {
          id: response.id,
          content: response.content,
          role: MessageRole.ASSISTANT,
          timestamp: response.timestamp,
          sessionId: response.sessionId,
          metadata: response.metadata
            ? {
                biomedicalData: Array.isArray(response.metadata.biomedicalData)
                  ? (response.metadata.biomedicalData as Record<
                      string,
                      unknown
                    >[])
                  : undefined,
                sources: response.metadata.sources,
                confidence: response.metadata.confidence,
                queryAnalysis: response.metadata.queryAnalysis
                  ? (response.metadata.queryAnalysis as Record<string, unknown>)
                  : undefined,
              }
            : undefined,
        };

        console.log(`✅ Message assistant reçu:`, assistantMessage);
        setMessages((prev) => [...prev, assistantMessage]);
        setIsLoading(false);
      }
    } catch (err) {
      setError("Failed to send message. Please try again.");
      console.error("Send message error:", err);

      // Remove the user message in case of error
      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
      setInput(messageToSend); // Restore the input
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Supprimer la session côté backend
      const result = await chatApiService.deleteSession(sessionId);
      console.log(
        `✅ Session ${result.sessionId} supprimée côté backend:`,
        result.success
      );

      // Supprimer les données locales
      localStorage.removeItem("sessionId");
      localStorage.removeItem("username");

      // Appeler la fonction de déconnexion parent
      onLogout();
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      // Déconnexion locale même en cas d'erreur
      localStorage.removeItem("sessionId");
      localStorage.removeItem("username");
      onLogout();
    }
  };

  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    setError("");

    try {
      console.log(`📄 Export PDF pour session: ${sessionId}`);
      console.log(`📊 Messages actuels dans la session: ${messages.length}`);
      console.log(
        `📊 Messages:`,
        messages.map((m) => ({
          id: m.id,
          content: m.content.substring(0, 50) + "...",
          role: m.role,
        }))
      );

      const blob = await chatApiService.exportConversationPDF(
        sessionId,
        true,
        "A4"
      );

      console.log(`📄 Taille du blob PDF: ${blob.size} bytes`);

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `conversation-${sessionId}-${
        new Date().toISOString().split("T")[0]
      }.pdf`;

      // Déclencher le téléchargement
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Nettoyer l'URL
      window.URL.revokeObjectURL(url);

      console.log(`✅ PDF exporté avec succès`);
      setExportSuccess(true);

      // Masquer la notification de succès après 3 secondes
      setTimeout(() => {
        setExportSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Erreur export PDF:", error);
      setError("Erreur lors de l'export PDF. Veuillez réessayer.");
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Notification de succès d'export */}
      {exportSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-[#60A5FA] text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3 transform transition-all duration-300 ease-in-out animate-pulse">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span className="font-medium">PDF exporté avec succès !</span>
        </div>
      )}

      {/* Header moderne avec identité Scienta Lab renforcée */}
      <Header
        onLogout={handleLogout}
        isConnected={isConnected}
        onExportPDF={handleExportPDF}
        isExportingPDF={isExportingPDF}
        userId={username}
        sessionId={sessionId}
        hasAssistantReplied={messages.some((m) => m.role === "assistant")}
      />

      {/* Zone de messages - plein écran */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-4xl mx-auto py-6">
          {error && (
            <div className="mx-4 mb-4 bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{error}</span>
                </div>
                <button
                  onClick={() => setError("")}
                  className="text-red-300 hover:text-red-100 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Message de bienvenue */}
          {messages.length === 0 && !isLoadingMessages && (
              <div className="text-center py-12 px-4">
                <div className="max-w-2xl mx-auto">
                  <div className="inline-flex items-center space-x-3 text-gray-600 mb-8">
                    <div className="w-8 h-8 bg-[#60A5FA] rounded-full flex items-center justify-center">
                      <span className="text-white text-lg">🧬</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Bienvenue, {username}!
                      </h3>
                      <p className="text-sm text-gray-600">
                        Posez-moi des questions sur la recherche biomédicale.
                      </p>
                    </div>
                  </div>

                  {/* Exemples de questions cliquables */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-4">
                      💡 Cliquez sur un exemple pour commencer :
                    </h4>

                    <div className="grid gap-3 text-left">
                      <button
                        onClick={() => {
                          handleSendMessage(
                            "Trouve-moi des articles récents sur les thérapies géniques pour le cancer du sein"
                          );
                        }}
                        className="bg-white hover:bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-[#60A5FA] transition-all text-left shadow-sm"
                      >
                        <div className="flex items-start space-x-3">
                          <span className="text-[#60A5FA] text-sm">🔬</span>
                          <div>
                            <p className="text-sm text-gray-900 font-medium">
                              Recherche de littérature
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              &ldquo;Trouve-moi des articles récents sur les
                              thérapies géniques pour le cancer du sein&rdquo;
                            </p>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          handleSendMessage(
                            "Quels sont les variants du gène BRCA1 associés au cancer ovarien ?"
                          );
                        }}
                        className="bg-white hover:bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-[#60A5FA] transition-all text-left shadow-sm"
                      >
                        <div className="flex items-start space-x-3">
                          <span className="text-[#60A5FA] text-sm">🧬</span>
                          <div>
                            <p className="text-sm text-gray-900 font-medium">
                              Variants génétiques
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              &ldquo;Quels sont les variants du gène BRCA1
                              associés au cancer ovarien ?&rdquo;
                            </p>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          handleSendMessage(
                            "Y a-t-il des essais cliniques en cours pour le traitement de la maladie d'Alzheimer ?"
                          );
                        }}
                        className="bg-white hover:bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-[#60A5FA] transition-all text-left shadow-sm"
                      >
                        <div className="flex items-start space-x-3">
                          <span className="text-[#60A5FA] text-sm">🏥</span>
                          <div>
                            <p className="text-sm text-gray-900 font-medium">
                              Essais cliniques
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              &ldquo;Y a-t-il des essais cliniques en cours pour
                              le traitement de la maladie d&apos;Alzheimer
                              ?&rdquo;
                            </p>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          handleSendMessage(
                            "Quelles sont les interactions entre la warfarine et les statines ?"
                          );
                        }}
                        className="bg-white hover:bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-[#60A5FA] transition-all text-left shadow-sm"
                      >
                        <div className="flex items-start space-x-3">
                          <span className="text-[#60A5FA] text-sm">💊</span>
                          <div>
                            <p className="text-sm text-gray-900 font-medium">
                              Interactions médicamenteuses
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              &ldquo;Quelles sont les interactions entre la
                              warfarine et les statines ?&rdquo;
                            </p>
                          </div>
                        </div>
                      </button>
                    </div>

                    <p className="text-xs text-gray-700 mt-6">
                      💬 Ou tapez votre propre question ci-dessous
                    </p>
                  </div>
                </div>
              </div>
            )}

          {/* Messages */}
          {!isLoadingMessages &&
            messages.map((message, index) => {
              console.log(
                `🔄 Rendu message ${index}:`,
                message.id,
                message.content.substring(0, 50)
              );
              return (
                <MessageBubble
                  key={message.id || `message-${index}`}
                  message={message}
                />
              );
            })}

          {/* Indicateur d'export PDF */}
          {isExportingPDF && (
            <div className="flex justify-center px-4 mb-6">
              <div className="bg-[#3B82F6] bg-opacity-10 border border-[#3B82F6] rounded-2xl px-6 py-4">
                <div className="flex items-center space-x-3 text-[#3B82F6]">
                  <svg
                    className="w-6 h-6 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <div>
                    <h3 className="text-lg font-medium">
                      Génération du PDF en cours...
                    </h3>
                    <p className="text-sm opacity-75">
                      Veuillez patienter pendant la création du document.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Indicateur de chargement */}
          {isLoading && (
            <div className="flex justify-start px-4 mb-6">
              <div className="bg-white rounded-2xl px-6 py-4 border border-gray-200 shadow-sm">
                <div className="flex items-center space-x-3 text-gray-700">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#60A5FA]"></div>
                  <span className="text-sm">L&apos;assistant réfléchit...</span>
                </div>
              </div>
            </div>
          )}

          {/* Indicateur de frappe */}
          {isTyping && !isLoading && (
            <div className="flex justify-start px-4 mb-6">
              <div className="bg-white rounded-2xl px-6 py-4 border border-gray-200 shadow-sm">
                <div className="flex items-center space-x-3 text-gray-700">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-[#60A5FA] rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-[#60A5FA] rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-[#60A5FA] rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                  <span className="text-sm">L&apos;assistant tape...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Zone de saisie fixe en bas - Style app de chat moderne */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <MessageInputBar
            input={input}
            setInput={setInput}
            onSendMessage={handleSendMessage}
            isLoading={isLoading || isExportingPDF}
          />
        </div>
      </div>
    </div>
  );
};

export default Chatbox;
