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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<IMessage[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);
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

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    setError("");

    // Add the user message immediately
    const userMessage: IMessage = {
      id: crypto.randomUUID(),
      content: input,
      role: MessageRole.USER,
      timestamp: new Date().toISOString(),
      sessionId,
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");

    try {
      if (isConnected) {
        // Use WebSocket for real-time communication
        console.log("📤 Sending message via WebSocket");
        sendMessage(currentInput, username, `Session de ${username}`);
      } else {
        // Fallback to HTTP API
        console.log("📤 Sending message via HTTP API (fallback)");
        const response = await chatApiService.sendMessage(
          sessionId,
          currentInput
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
      setInput(currentInput); // Restore the input
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

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setShowSearchResults(false);
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setError("");

    try {
      console.log(`🔍 Recherche: "${searchQuery}" dans session ${sessionId}`);
      const results = await chatApiService.searchMessages(
        sessionId,
        searchQuery,
        20
      );

      setSearchResults(results.messages.map(convertMessageToIMessage));
      setShowSearchResults(true);

      console.log(`✅ ${results.totalCount} résultats trouvés`);
    } catch (err) {
      console.error("Erreur de recherche:", err);
      setError("Erreur lors de la recherche. Veuillez réessayer.");
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
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
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Notification de succès d'export */}
      {exportSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-[#34D399] text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3 transform transition-all duration-300 ease-in-out animate-pulse">
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

      {/* Header moderne */}
      <Header
        onLogout={handleLogout}
        isConnected={isConnected}
        onExportPDF={handleExportPDF}
        isExportingPDF={isExportingPDF}
        userId={username}
        sessionId={sessionId}
      />

      {/* Barre de recherche */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Rechercher dans cette conversation..."
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#34D399] focus:border-[#34D399]"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
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
              )}
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="px-4 py-2 bg-[#34D399] hover:bg-[#2ba085] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              {isSearching ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Recherche...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Rechercher</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Zone de messages - plein écran */}
      <div className="flex-1 overflow-y-auto bg-gray-900">
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

          {/* Résultats de recherche */}
          {showSearchResults && (
            <div className="mx-4 mb-6">
              <div className="bg-[#34D399]/10 border border-[#34D399]/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-[#34D399]">
                    Résultats de recherche pour &quot;{searchQuery}&quot;
                  </h3>
                  <span className="text-sm text-gray-400">
                    {searchResults.length} résultat(s)
                  </span>
                </div>
                {searchResults.length > 0 ? (
                  <div className="space-y-3">
                    {searchResults.map((message, index) => (
                      <MessageBubble
                        key={`search-${message.id || index}`}
                        message={message}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-4">
                    Aucun résultat trouvé pour &quot;{searchQuery}&quot;
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Message de bienvenue */}
          {messages.length === 0 &&
            !isLoadingMessages &&
            !showSearchResults && (
              <div className="text-center py-12 px-4">
                <div className="max-w-2xl mx-auto">
                  <div className="inline-flex items-center space-x-3 text-gray-400 mb-8">
                    <div className="w-8 h-8 bg-[#34D399] rounded-full flex items-center justify-center">
                      <span className="text-white text-lg">🧬</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white">
                        Bienvenue, {username}!
                      </h3>
                      <p className="text-sm">
                        Posez-moi des questions sur la recherche biomédicale.
                      </p>
                    </div>
                  </div>

                  {/* Exemples de questions */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-300 mb-4">
                      💡 Exemples de questions que vous pouvez poser :
                    </h4>

                    <div className="grid gap-3 text-left">
                      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                        <div className="flex items-start space-x-3">
                          <span className="text-[#34D399] text-sm">🔬</span>
                          <div>
                            <p className="text-sm text-gray-300 font-medium">
                              Recherche de littérature
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              &ldquo;Trouve-moi des articles récents sur les
                              thérapies géniques pour le cancer du sein&rdquo;
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                        <div className="flex items-start space-x-3">
                          <span className="text-[#34D399] text-sm">🧬</span>
                          <div>
                            <p className="text-sm text-gray-300 font-medium">
                              Variants génétiques
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              &ldquo;Quels sont les variants du gène BRCA1
                              associés au cancer ovarien ?&rdquo;
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                        <div className="flex items-start space-x-3">
                          <span className="text-[#34D399] text-sm">🏥</span>
                          <div>
                            <p className="text-sm text-gray-300 font-medium">
                              Essais cliniques
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              &ldquo;Y a-t-il des essais cliniques en cours pour
                              le traitement de la maladie d&apos;Alzheimer
                              ?&rdquo;
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                        <div className="flex items-start space-x-3">
                          <span className="text-[#34D399] text-sm">💊</span>
                          <div>
                            <p className="text-sm text-gray-300 font-medium">
                              Interactions médicamenteuses
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              &ldquo;Quelles sont les interactions entre la
                              warfarine et les statines ?&rdquo;
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-6">
                      💬 Tapez votre question dans la barre ci-dessous pour
                      commencer
                    </p>
                  </div>
                </div>
              </div>
            )}

          {/* Messages */}
          {!isLoadingMessages &&
            !showSearchResults &&
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
              <div className="bg-gray-800 rounded-2xl px-6 py-4 border border-gray-700">
                <div className="flex items-center space-x-3 text-gray-400">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#34D399]"></div>
                  <span className="text-sm">L&apos;assistant réfléchit...</span>
                </div>
              </div>
            </div>
          )}

          {/* Indicateur de frappe */}
          {isTyping && !isLoading && (
            <div className="flex justify-start px-4 mb-6">
              <div className="bg-gray-800 rounded-2xl px-6 py-4 border border-gray-700">
                <div className="flex items-center space-x-3 text-gray-400">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-[#34D399] rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-[#34D399] rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-[#34D399] rounded-full animate-bounce"
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

      {/* Zone de saisie fixe en bas */}
      <div className="flex-shrink-0 bg-gray-900 border-t border-gray-700 p-4">
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
