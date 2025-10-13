"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

interface HeaderProps {
  onLogout: () => void;
  isConnected?: boolean;
  onExportPDF?: () => void;
  isExportingPDF?: boolean;
  userId?: string;
  sessionId?: string;
}

const Header = ({
  onLogout,
  isConnected = false,
  onExportPDF,
  isExportingPDF = false,
  userId,
  sessionId,
}: HeaderProps) => {
  const router = useRouter();

  const handleLogout = () => {
    onLogout();
    router.push("/");
  };

  return (
    <header className="bg-gray-900 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo Scienta Lab */}
        <div className="flex items-center space-x-3">
          <div className="relative w-8 h-8 flex items-center justify-center">
            <Image
              src="/assets/logo/logo.png"
              alt="Scienta Lab Logo"
              fill
              className="object-contain"
              onError={(e) => {
                console.log("Logo failed to load, using fallback");
                e.currentTarget.style.display = "none";
              }}
            />
            {/* Fallback icon if logo fails to load */}
            <div className="absolute inset-0 flex items-center justify-center bg-[#34D399] rounded-full text-white font-bold text-sm">
              SL
            </div>
          </div>
          <h1 className="text-xl font-bold text-white">
            Scienta Lab <span className="text-[#34D399]">Assistant</span>
          </h1>

          {/* Informations utilisateur et session */}
          <div className="flex items-center space-x-4">
            {/* Indicateur de connexion WebSocket */}
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isConnected ? "bg-[#34D399]" : "bg-gray-500"
                }`}
              ></div>
              <span className="text-xs text-gray-400">
                {isConnected ? "Temps réel" : "HTTP"}
              </span>
              {!isConnected && (
                <span className="text-xs text-yellow-400 animate-pulse">
                  Reconnexion...
                </span>
              )}
            </div>

            {/* Informations utilisateur */}
            {userId && (
              <div className="flex items-center space-x-2 text-xs text-gray-400">
                <span className="text-gray-500">👤</span>
                <span>User: {userId.substring(0, 8)}...</span>
              </div>
            )}

            {/* Informations session */}
            {sessionId && (
              <div className="flex items-center space-x-2 text-xs text-gray-400">
                <span className="text-gray-500">🔗</span>
                <span>Session: {sessionId.substring(0, 8)}...</span>
              </div>
            )}
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex items-center space-x-3">
          {/* Bouton export PDF */}
          {onExportPDF && (
            <button
              onClick={onExportPDF}
              disabled={isExportingPDF}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                isExportingPDF
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-[#3B82F6] hover:bg-[#2563eb] text-white"
              }`}
              title={
                isExportingPDF
                  ? "Génération du PDF en cours..."
                  : "Exporter la conversation en PDF"
              }
            >
              {isExportingPDF ? (
                <>
                  <svg
                    className="w-5 h-5 animate-spin"
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
                  <span>Génération...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span>Export PDF</span>
                </>
              )}
            </button>
          )}

          {/* Bouton déconnexion */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors duration-200"
            title="Se déconnecter"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
