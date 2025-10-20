"use client";

import { chatApiService } from "@/services/chat-api.service";
import { useState } from "react";
import Image from "next/image";

interface ConnexionFormProps {
  onLoginSuccess: (sessionId: string, username: string) => void;
}

const ConnexionForm = ({ onLoginSuccess }: ConnexionFormProps) => {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!username.trim()) {
      setError("Veuillez saisir un nom d'utilisateur");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      console.log(`🔄 Création de session pour l'utilisateur: ${username}`);

      const session = await chatApiService.createSession(
        username.trim(),
        `Session de ${username}`
      );

      console.log(`✅ Session créée avec succès:`, session.id);
      console.log(`📊 Session complète:`, session);
      onLoginSuccess(session.id, username.trim());
    } catch (err) {
      console.error("❌ Erreur lors de la création de session:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de la connexion. Veuillez réessayer."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-12 h-12 mr-3 flex items-center justify-center">
              <Image
                src="/assets/logo/logo.png"
                alt="Scienta Lab Logo"
                width={48}
                height={48}
                className="w-full h-full object-contain"
                onError={(e) => {
                  console.log("Logo failed to load, using fallback");
                  e.currentTarget.style.display = "none";
                }}
              />
              {/* Fallback icon if logo fails to load */}
              <div className="absolute inset-0 flex items-center justify-center bg-[#60A5FA] rounded-full text-white font-bold text-lg">
                SL
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white">
              Scienta Lab <span className="text-[#60A5FA]">Assistant</span>
            </h1>
          </div>
          <p className="text-gray-400 mb-8">
            Assistant de recherche biomédicale intelligent
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Nom d&apos;utilisateur
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Entrez votre nom"
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-600 rounded-xl shadow-sm bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:border-[#60A5FA] disabled:opacity-50 transition-all duration-200"
              autoComplete="username"
            />
          </div>

          {error && (
            <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-md">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !username.trim()}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-[#60A5FA] hover:bg-[#3B82F6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#60A5FA] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg hover:scale-105"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Connexion en cours...
              </div>
            ) : (
              "Se connecter"
            )}
          </button>
        </form>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            En vous connectant, vous acceptez de commencer une nouvelle session
            de chat
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConnexionForm;
