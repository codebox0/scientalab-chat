"use client";

import { useRouter } from "next/navigation";

interface HeaderProps {
  onLogout: () => void;
  isConnected?: boolean;
  onExportPDF?: () => void;
  isExportingPDF?: boolean;
  userId?: string;
  sessionId?: string;
  hasAssistantReplied?: boolean;
}

const Header = ({
  onLogout,
  onExportPDF,
  isExportingPDF = false,
  hasAssistantReplied = false,
  userId,
}: HeaderProps) => {
  const router = useRouter();

  const handleLogout = () => {
    onLogout();
    router.push("/");
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo Scienta Lab - Simplifié */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#60A5FA] rounded-full flex items-center justify-center text-white font-bold text-sm">
              SL
            </div>
            <h1 className="text-lg font-semibold text-gray-900">
              Scienta Lab
            </h1>
          </div>
          {userId && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-lg">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">{userId}</span>
            </div>
          )}
        </div>

        {/* Boutons d'action */}
        <div className="flex items-center space-x-3">
          {/* Export PDF - icône uniquement */}
          {onExportPDF && hasAssistantReplied && (
            <button
              onClick={onExportPDF}
              disabled={isExportingPDF}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Exporter en PDF"
            >
              {isExportingPDF ? (
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
              ) : (
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
              )}
            </button>
          )}

          {/* Déconnexion - avec texte */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
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
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
