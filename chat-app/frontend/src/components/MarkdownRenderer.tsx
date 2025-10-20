"use client";

// import "highlight.js/styles/github-dark.css";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer = ({ content }: MarkdownRendererProps) => {
  return (
    <div className="markdown-content prose prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-white mt-6 mb-4">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold text-white mt-5 mb-3">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold text-white mt-4 mb-2">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-base font-semibold text-white mt-3 mb-2">
              {children}
            </h4>
          ),
          h5: ({ children }) => (
            <h5 className="text-sm font-semibold text-white mt-3 mb-2">
              {children}
            </h5>
          ),
          h6: ({ children }) => (
            <h6 className="text-xs font-semibold text-white mt-3 mb-2">
              {children}
            </h6>
          ),
          p: ({ children }) => (
            <p className="text-gray-300 leading-relaxed mb-3">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-white">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-gray-300">{children}</em>
          ),
          code: ({ children, className }) => {
            const isInline = !className;
            return isInline ? (
              <code className="bg-gray-800 text-[#60A5FA] px-2 py-1 rounded text-sm font-mono">
                {children}
              </code>
            ) : (
              <code className="text-[#60A5FA] font-mono text-sm">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-gray-800 border border-gray-600 rounded-lg p-4 my-4 overflow-x-auto">
              {children}
            </pre>
          ),
          ul: ({ children }) => (
            <ul className="list-none space-y-1 my-3">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1 my-3">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-gray-300 ml-4 mb-1">• {children}</li>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              className="text-[#60A5FA] hover:text-[#3B82F6] underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-[#60A5FA] pl-4 italic text-gray-400 my-4">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border border-gray-600 rounded-lg">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gray-800">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody className="bg-gray-900">{children}</tbody>
          ),
          tr: ({ children }) => (
            <tr className="border-b border-gray-600">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2 text-left text-white font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 text-gray-300">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
