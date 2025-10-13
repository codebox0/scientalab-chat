"use client";

import { useMemo } from "react";

interface JsonRendererProps {
  data: unknown;
  title?: string;
}

const JsonRenderer = ({ data, title }: JsonRendererProps) => {
  const formattedJson = useMemo(() => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  }, [data]);

  const syntaxHighlight = (json: string) => {
    return json
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(
        /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
        (match) => {
          let cls = "text-gray-300";
          if (/^"/.test(match)) {
            if (/:$/.test(match)) {
              cls = "text-[#34D399] font-semibold"; // Keys
            } else {
              cls = "text-blue-300"; // Strings
            }
          } else if (/true|false/.test(match)) {
            cls = "text-yellow-300"; // Booleans
          } else if (/null/.test(match)) {
            cls = "text-gray-500"; // Null
          } else if (/^-?\d/.test(match)) {
            cls = "text-green-300"; // Numbers
          }
          return `<span class="${cls}">${match}</span>`;
        }
      );
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(formattedJson);
  };

  return (
    <div className="space-y-4">
      {title && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-white">{title}</h3>
          <button
            onClick={copyToClipboard}
            className="px-3 py-1 bg-[#34D399] text-white rounded text-sm hover:bg-[#2ba085] transition-colors"
          >
            Copier
          </button>
        </div>
      )}

      <div className="relative">
        <pre className="bg-gray-800 border border-gray-600 rounded-lg p-4 overflow-auto text-sm font-mono max-h-96">
          <code
            dangerouslySetInnerHTML={{
              __html: syntaxHighlight(formattedJson),
            }}
          />
        </pre>
      </div>
    </div>
  );
};

export default JsonRenderer;
