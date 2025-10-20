/**
 * Message input bar props
 * @property {string} input - The input value
 * @property {function} setInput - The function to set the input value
 * @property {function} sendMessage - The function to send the message
 * @property {boolean} disabled - Whether the input is disabled
 */
interface MessageInputBarProps {
  input: string;
  setInput: (input: string) => void;
  onSendMessage: () => void;
  isLoading?: boolean;
}

const MessageInputBar = ({
  input,
  setInput,
  onSendMessage,
  isLoading = false,
}: MessageInputBarProps) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize textarea
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isLoading && input.trim()) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <div className="flex gap-3 items-end">
      <div className="flex-1 relative">
        <textarea
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          rows={1}
          className={`w-full px-5 py-4 rounded-2xl border resize-none transition-all duration-200 ${
            isLoading
              ? "bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-[#60A5FA] focus:ring-2 focus:ring-[#60A5FA]/20"
          }`}
          style={{
            minHeight: "56px",
            maxHeight: "200px",
          }}
          placeholder={
            isLoading
              ? "L'assistant réfléchit..."
              : "Tapez votre message... (Shift + Enter pour nouvelle ligne)"
          }
        />
      </div>
      <button
        onClick={onSendMessage}
        disabled={isLoading || !input.trim()}
        className={`min-w-[56px] h-14 rounded-2xl font-medium transition-all duration-200 flex items-center justify-center ${
          isLoading || !input.trim()
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-[#60A5FA] text-white hover:bg-[#3B82F6] hover:shadow-lg hover:scale-105"
        }`}
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        ) : (
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
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        )}
      </button>
    </div>
  );
};

export default MessageInputBar;
