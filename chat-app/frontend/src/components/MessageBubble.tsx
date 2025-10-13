"use client";

import { IMessage, MessageRole } from "@/store/Message";
import { ReactNode, useState } from "react";
import BioMCPModal from "./BioMCPModal";
import MarkdownRenderer from "./MarkdownRenderer";

// Type pour queryAnalysis - plus flexible que unknown
type QueryAnalysis = Record<string, unknown>;

const BiomedicalInfo = ({
  biomedicalInfo,
}: {
  biomedicalInfo: string[] | null;
}): ReactNode => {
  if (
    !biomedicalInfo ||
    !Array.isArray(biomedicalInfo) ||
    biomedicalInfo.length === 0
  ) {
    return null;
  }

  return (
    <div className="space-y-1 mb-2">
      {(biomedicalInfo as string[]).map((info: string, index: number) => (
        <div key={index} className="text-xs text-[#34D399] flex items-center">
          <span className="mr-1">{info}</span>
        </div>
      ))}
    </div>
  );
};

const MessageBubble = ({ message }: { message: IMessage }) => {
  const [isBioMCPModalOpen, setIsBioMCPModalOpen] = useState(false);

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString();
  };

  const renderMetadata = () => {
    if (!message.metadata || message.role === MessageRole.USER) return null;

    const { sources, confidence, biomedicalData, queryAnalysis } =
      message.metadata;

    // Analyser les données biomédicales pour extraire des infos pertinentes
    const getBiomedicalInfo = (): string[] | null => {
      if (
        !biomedicalData ||
        !Array.isArray(biomedicalData) ||
        biomedicalData.length === 0
      )
        return null;

      const data = biomedicalData[0]; // Prendre le premier résultat
      const info = [];

      // Extraire des informations spécifiques selon le type de données
      if (data.title) info.push(`📄 ${data.title}`);
      if (data.gene) info.push(`🧬 Gène: ${data.gene}`);
      if (data.variant) info.push(`🔬 Variant: ${data.variant}`);
      if (data.disease) info.push(`🏥 Maladie: ${data.disease}`);
      if (data.drug) info.push(`💊 Médicament: ${data.drug}`);
      if (data.author) info.push(`👤 Auteur: ${data.author}`);
      if (data.pmid) info.push(`🔗 PMID: ${data.pmid}`);
      if (data.clinical_trial_id)
        info.push(`🏥 Essai: ${data.clinical_trial_id}`);

      return info.length > 0
        ? info.slice(0, 3)
        : [`🧬 ${(biomedicalData as unknown[]).length} résultat(s) trouvé(s)`];
    };

    const biomedicalInfo = getBiomedicalInfo();
    const hasRealSources =
      sources && sources.length > 0 && !sources.every((s) => s === "Unknown");

    return (
      <div className="mt-3 pt-3 border-t border-gray-600">
        <BiomedicalInfo biomedicalInfo={biomedicalInfo as string[] | null} />

        {queryAnalysis && (
          <div className="text-xs text-gray-400 mb-2">
            🔍 Type:{" "}
            {((queryAnalysis as QueryAnalysis).type as string) ||
              "Recherche générale"}
            {typeof (queryAnalysis as QueryAnalysis).confidence ===
              "number" && (
              <span className="ml-2">
                • Confiance:{" "}
                {Math.round(
                  ((queryAnalysis as QueryAnalysis).confidence as number) * 100
                )}
                %
              </span>
            )}
          </div>
        )}

        {hasRealSources && (
          <div className="text-xs text-gray-400 mb-2">
            📚 Sources: {sources.filter((s) => s !== "Unknown").join(", ")}
          </div>
        )}

        {confidence && !queryAnalysis?.confidence && (
          <div className="text-xs text-gray-400 mb-2 flex items-center">
            <span className="w-2 h-2 bg-[#34D399] rounded-full mr-2"></span>
            Confiance: {Math.round(confidence * 100)}%
          </div>
        )}
      </div>
    );
  };

  const hasBioMCPData =
    message.metadata &&
    message.role === MessageRole.ASSISTANT &&
    ((message.metadata.biomedicalData &&
      message.metadata.biomedicalData.length > 0) ||
      message.metadata.queryAnalysis ||
      (message.metadata.sources && message.metadata.sources.length > 0) ||
      message.metadata.confidence);

  // Debug pour voir les métadonnées disponibles
  if (message.role === MessageRole.ASSISTANT && message.metadata) {
    console.log("🔍 MessageBubble Debug:", {
      hasMetadata: !!message.metadata,
      hasBiomedicalData: !!(
        message.metadata.biomedicalData &&
        message.metadata.biomedicalData.length > 0
      ),
      hasQueryAnalysis: !!message.metadata.queryAnalysis,
      hasSources: !!(
        message.metadata.sources && message.metadata.sources.length > 0
      ),
      hasConfidence: !!message.metadata.confidence,
      hasBioMCPData,
      metadata: message.metadata,
    });
  }

  return (
    <>
      <div
        className={`flex ${
          message.role === MessageRole.USER ? "justify-end" : "justify-start"
        } mb-6 px-4`}
      >
        <div
          className={`max-w-[85%] rounded-2xl px-6 py-4 shadow-lg ${
            message.role === MessageRole.USER
              ? "bg-[#3B82F6] text-white"
              : "bg-gray-800 text-gray-100 border border-gray-700"
          }`}
        >
          <div className="leading-relaxed">
            {message.role === MessageRole.ASSISTANT ? (
              <MarkdownRenderer content={message.content} />
            ) : (
              <div className="whitespace-pre-wrap text-white">
                {message.content}
              </div>
            )}
          </div>

          {renderMetadata()}

          <div className="text-xs opacity-60 mt-3 flex items-center justify-between">
            <span>{formatTimestamp(message.timestamp)}</span>
            <div className="flex items-center space-x-2">
              {message.role === MessageRole.ASSISTANT && hasBioMCPData && (
                <button
                  onClick={() => setIsBioMCPModalOpen(true)}
                  className="inline-flex items-center space-x-1 px-2 py-1 bg-[#34D399]/10 hover:bg-[#34D399]/20 text-[#34D399] rounded-md transition-colors text-xs font-medium"
                  title="Voir les données BioMCP complètes"
                >
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" />
                    <path d="M6 8h8v2H6V8zm0 3h8v2H6v-2z" />
                  </svg>
                  <span>BioMCP</span>
                </button>
              )}
              {message.role === MessageRole.ASSISTANT && (
                <span className="text-[#34D399]">🤖 Assistant</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal BioMCP */}
      {hasBioMCPData && (
        <BioMCPModal
          isOpen={isBioMCPModalOpen}
          onClose={() => setIsBioMCPModalOpen(false)}
          data={{
            request: message.metadata?.queryAnalysis,
            response: message.metadata?.biomedicalData,
            logs: message.metadata?.biomedicalData,
          }}
        />
      )}
    </>
  );
};

export default MessageBubble;
