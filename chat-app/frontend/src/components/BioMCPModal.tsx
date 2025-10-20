"use client";

import { useState } from "react";
import JsonRenderer from "./JsonRenderer";

interface BioMCPModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    request?: unknown;
    response?: unknown;
    logs?: unknown[];
  };
}

const BioMCPModal = ({ isOpen, onClose, data }: BioMCPModalProps) => {
  const [activeTab, setActiveTab] = useState<"request" | "response" | "logs">(
    "request"
  );

  if (!isOpen) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatJson = (obj: unknown) => {
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return String(obj);
    }
  };

  const tabs = [
    { id: "request", label: "Requête", icon: "📤" },
    { id: "response", label: "Réponse", icon: "📥" },
    { id: "logs", label: "Logs", icon: "📋" },
  ] as const;

  // Filtrer les onglets selon les données disponibles
  const availableTabs = tabs.filter((tab) => {
    switch (tab.id) {
      case "request":
        return data.request;
      case "response":
        return data.response && Array.isArray(data.response) && data.response.length > 0;
      case "logs":
        return data.logs && Array.isArray(data.logs) && data.logs.length > 0;
      default:
        return false;
    }
  });

  // Si aucun onglet n'est disponible, afficher au moins les métadonnées
  const hasAnyData =
    data.request ||
    (data.response && Array.isArray(data.response) && data.response.length > 0) ||
    (data.logs && Array.isArray(data.logs) && data.logs.length > 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <span className="text-[#60A5FA] mr-2">📄</span>
            Données BioMCP
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          {availableTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-[#60A5FA] border-b-2 border-[#60A5FA] bg-gray-800"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === "request" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">
                  Requête JSON-RPC
                </h3>
                <button
                  onClick={() => copyToClipboard(formatJson(data.request))}
                  className="px-3 py-1 bg-[#60A5FA] text-white rounded text-sm hover:bg-[#3B82F6] transition-colors"
                >
                  Copier
                </button>
              </div>
              <pre className="bg-gray-800 p-4 rounded-lg overflow-auto text-sm text-gray-300 font-mono">
                {formatJson(data.request)}
              </pre>
            </div>
          )}

          {activeTab === "response" && (
            <JsonRenderer data={data.response} title="Réponse BioMCP" />
          )}

          {activeTab === "logs" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">
                  Logs de Debug
                </h3>
                <button
                  onClick={() => copyToClipboard(formatJson(data.logs))}
                  className="px-3 py-1 bg-[#60A5FA] text-white rounded text-sm hover:bg-[#3B82F6] transition-colors"
                >
                  Copier
                </button>
              </div>
              <div className="space-y-2">
                {data.logs?.map((log, index) => (
                  <div key={index} className="bg-gray-800 p-3 rounded-lg">
                    <div className="text-sm text-gray-300 font-mono">
                      {formatJson(log)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fallback si aucune donnée spécifique */}
          {!hasAnyData && (
            <div className="space-y-4">
              <div className="text-center py-8">
                <div className="text-[#60A5FA] text-4xl mb-4">📊</div>
                <h3 className="text-lg font-medium text-white mb-2">
                  Métadonnées disponibles
                </h3>
                <p className="text-gray-400 mb-4">
                  Aucune donnée BioMCP spécifique trouvée, mais voici les
                  métadonnées disponibles :
                </p>
                <div className="bg-gray-800 p-4 rounded-lg text-left">
                  <pre className="text-sm text-gray-300 font-mono">
                    {formatJson(data)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BioMCPModal;
