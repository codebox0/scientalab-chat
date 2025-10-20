"use client";

import { useState, useEffect } from "react";

interface TooltipsGuideProps {
  isFirstVisit?: boolean;
}

const TooltipsGuide = ({ isFirstVisit = false }: TooltipsGuideProps) => {
  const [isOpen, setIsOpen] = useState(isFirstVisit);

  useEffect(() => {
    // Check if tooltips have been shown before
    const shown = localStorage.getItem("tooltipsShown");
    if (!shown && isFirstVisit) {
      setIsOpen(true);
      localStorage.setItem("tooltipsShown", "true");
    }
  }, [isFirstVisit]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-8 z-40 w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-blue-500/50 transition-all duration-300 hover:scale-110 flex items-center justify-center"
        title="Afficher l'aide"
      >
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
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>
    );
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        {/* Guide Modal */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 max-w-3xl w-full shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <span className="text-2xl">👋</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Bienvenue sur Scienta Lab Chat
                  </h2>
                  <p className="text-blue-100 text-sm">
                    Découvrez les fonctionnalités de votre assistant biomédical
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                title="Fermer"
              >
                <svg
                  className="w-6 h-6"
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

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            <div className="grid gap-4">
              {/* Feature 1: Exemples cliquables */}
              <div className="bg-gray-700/50 rounded-xl p-5 border border-gray-600 hover:border-blue-500 transition-all">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">💡</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Exemples de questions
                    </h3>
                    <p className="text-gray-300 text-sm mb-3">
                      Sur la page d&apos;accueil, cliquez directement sur les
                      exemples pour démarrer une recherche instantanée sans
                      avoir à taper.
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-blue-400">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Littérature • Variants • Essais • Médicaments</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature 2: Barre de message */}
              <div className="bg-gray-700/50 rounded-xl p-5 border border-gray-600 hover:border-blue-500 transition-all">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">💬</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Zone de message
                    </h3>
                    <p className="text-gray-300 text-sm mb-3">
                      Tapez votre question dans la grande zone de texte en bas.
                      La zone s&apos;agrandit automatiquement pour les messages
                      longs.
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-emerald-400">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Entrée = Envoyer • Shift + Entrée = Nouvelle ligne</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature 3: Recherche FAB */}
              <div className="bg-gray-700/50 rounded-xl p-5 border border-gray-600 hover:border-blue-500 transition-all">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🔍</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Bouton de recherche flottant
                    </h3>
                    <p className="text-gray-300 text-sm mb-3">
                      Le bouton rond vert à droite de l&apos;écran vous permet de
                      rechercher dans l&apos;historique de vos conversations.
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-purple-400">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Recherche instantanée dans toute la conversation</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature 4: Export PDF */}
              <div className="bg-gray-700/50 rounded-xl p-5 border border-gray-600 hover:border-blue-500 transition-all">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📄</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Export PDF
                    </h3>
                    <p className="text-gray-300 text-sm mb-3">
                      Cliquez sur &ldquo;Export PDF&rdquo; dans le header pour télécharger
                      votre conversation complète en format PDF.
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-amber-400">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Sauvegarde hors ligne de vos recherches</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature 5: Badges de type */}
              <div className="bg-gray-700/50 rounded-xl p-5 border border-gray-600 hover:border-blue-500 transition-all">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🏷️</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Badges de type de recherche
                    </h3>
                    <p className="text-gray-300 text-sm mb-3">
                      Chaque réponse affiche des badges colorés indiquant le
                      type de recherche effectuée et la confiance du système.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs bg-purple-500/10 text-purple-400 border border-purple-500/30">
                        <span>📚</span>
                        <span>Littérature</span>
                      </span>
                      <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs bg-blue-500/10 text-blue-400 border border-blue-500/30">
                        <span>🏥</span>
                        <span>Essais</span>
                      </span>
                      <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs bg-pink-500/10 text-pink-400 border border-pink-500/30">
                        <span>🧬</span>
                        <span>Variants</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-700/30 border-t border-gray-600 p-4 flex items-center justify-between">
            <p className="text-sm text-gray-400">
              💡 Cliquez sur le bouton d&apos;aide en bas à droite pour revoir ce
              guide
            </p>
            <button
              onClick={() => setIsOpen(false)}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors"
            >
              Commencer
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TooltipsGuide;
