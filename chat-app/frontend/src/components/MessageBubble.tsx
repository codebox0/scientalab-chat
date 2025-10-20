"use client";

import { IMessage, MessageRole } from "@/store/Message";
import { ReactNode } from "react";
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
        <div key={index} className="text-xs text-[#60A5FA] flex items-center">
          <span className="mr-1">{info}</span>
        </div>
      ))}
    </div>
  );
};

const MessageBubble = ({ message }: { message: IMessage }) => {
  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString();
  };

  // Get query type badge configuration
  const getQueryTypeBadge = (
    type: string
  ): { label: string; icon: string; color: string; bgColor: string } => {
    switch (type) {
      case "literature":
        return {
          label: "Littérature",
          icon: "📚",
          color: "text-purple-400",
          bgColor: "bg-purple-500/10 border-purple-500/30",
        };
      case "trial":
        return {
          label: "Essais Cliniques",
          icon: "🏥",
          color: "text-blue-400",
          bgColor: "bg-blue-500/10 border-blue-500/30",
        };
      case "variant":
        return {
          label: "Variants Génétiques",
          icon: "🧬",
          color: "text-pink-400",
          bgColor: "bg-pink-500/10 border-pink-500/30",
        };
      case "drug":
        return {
          label: "Médicaments",
          icon: "💊",
          color: "text-amber-400",
          bgColor: "bg-amber-500/10 border-amber-500/30",
        };
      default:
        return {
          label: "Général",
          icon: "💬",
          color: "text-gray-700",
          bgColor: "bg-gray-500/10 border-gray-500/30",
        };
    }
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

    // Render query type badge
    const renderQueryTypeBadge = () => {
      if (!queryAnalysis) return null;
      const queryType = (queryAnalysis as QueryAnalysis).type as string;
      const badge = getQueryTypeBadge(queryType || "general");
      return (
        <span
          key="query-type-badge"
          className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${badge.bgColor} ${badge.color}`}
        >
          <span>{badge.icon}</span>
          <span>{badge.label}</span>
        </span>
      );
    };

    // Render confidence badge
    const renderConfidenceBadge = () => {
      if (
        !queryAnalysis ||
        typeof (queryAnalysis as QueryAnalysis).confidence !== "number"
      )
        return null;
      return (
        <span
          key="confidence-badge"
          className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs bg-[#60A5FA]/10 text-[#60A5FA] border border-[#60A5FA]/30"
        >
          <svg
            className="w-3 h-3"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span>
            {Math.round(
              ((queryAnalysis as QueryAnalysis).confidence as number) * 100
            )}
            % confiance
          </span>
        </span>
      );
    };

    // Render entities badge
    const renderEntitiesBadge = () => {
      if (
        !queryAnalysis ||
        !((queryAnalysis as QueryAnalysis).entities &&
          typeof (queryAnalysis as QueryAnalysis).entities === "object")
      )
        return null;

      const entities = (queryAnalysis as QueryAnalysis)
        .entities as Record<string, string[]>;
      const totalEntities = Object.values(entities).reduce(
        (sum, arr) => sum + (arr?.length || 0),
        0
      );
      if (totalEntities > 0) {
        return (
          <span
            key="entities-badge"
            className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
          >
            <span>🔬</span>
            <span>{totalEntities} entités détectées</span>
          </span>
        );
      }
      return null;
    };

    return (
      <div className="mt-3 pt-3 border-t border-white/30">
        <BiomedicalInfo biomedicalInfo={biomedicalInfo as string[] | null} />

        {queryAnalysis && (
          <div className="flex items-center space-x-2 mb-2 flex-wrap gap-2">
            {renderQueryTypeBadge()}
            {renderConfidenceBadge()}
            {renderEntitiesBadge()}
          </div>
        )}

        {hasRealSources && (
          <div className="text-xs text-gray-300 mb-2">
            📚 Sources: {sources.filter((s) => s !== "Unknown").join(", ")}
          </div>
        )}

        {confidence && !queryAnalysis?.confidence && (
          <div className="text-xs text-gray-300 mb-2 flex items-center">
            <span className="w-2 h-2 bg-[#60A5FA] rounded-full mr-2"></span>
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
          className={`max-w-[75%] rounded-2xl px-5 py-3 ${
            message.role === MessageRole.USER
              ? "bg-[#3B82F6] text-white shadow-sm"
              : "bg-black text-white border border-white"
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

          {/* Footer with timestamp */}
          <div className={`text-xs mt-2 ${
            message.role === MessageRole.USER ? "text-blue-100" : "text-gray-300"
          }`}>
            <span>{formatTimestamp(message.timestamp)}</span>
          </div>
        </div>
      </div>

    </>
  );
};

export default MessageBubble;
