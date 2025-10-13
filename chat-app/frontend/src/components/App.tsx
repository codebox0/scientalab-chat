"use client";

import { useSession } from "@/hooks/useSession";
import Chatbox from "./Chatbox";
import ConnexionForm from "./ConnexionForm";

const App = () => {
  const { sessionData, isLoading, saveSession, clearSession, isLoggedIn } =
    useSession();

  const handleLoginSuccess = (sessionId: string, username: string) => {
    saveSession(sessionId, username);
  };

  const handleLogout = () => {
    clearSession();
  };

  // Afficher un loader pendant la vérification
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Vérification de la session...</p>
          <p className="text-gray-500 text-sm mt-2">
            Validation côté serveur en cours
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {!isLoggedIn && <ConnexionForm onLoginSuccess={handleLoginSuccess} />}

      {isLoggedIn && sessionData && (
        <Chatbox
          sessionId={sessionData.sessionId}
          username={sessionData.username}
          onLogout={handleLogout}
        />
      )}
    </>
  );
};

export default App;
