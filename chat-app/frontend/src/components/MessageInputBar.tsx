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
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isLoading && input.trim()) {
      onSendMessage();
    }
  };

  return (
    <div className="flex gap-3">
      <div className="flex-1 relative">
        <input
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
            isLoading
              ? "bg-gray-800 border-gray-600 text-gray-500 cursor-not-allowed"
              : "bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-[#34D399] focus:ring-2 focus:ring-[#34D399]/20"
          }`}
          placeholder={
            isLoading
              ? "L'assistant réfléchit..."
              : "Posez une question sur la recherche biomédicale..."
          }
        />
      </div>
      <button
        onClick={onSendMessage}
        disabled={isLoading || !input.trim()}
        className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 ${
          isLoading || !input.trim()
            ? "bg-gray-700 text-gray-500 cursor-not-allowed"
            : "bg-[#34D399] text-white hover:bg-[#2ba085] hover:shadow-lg hover:scale-105"
        }`}
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Envoi...</span>
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
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
            <span>Envoyer</span>
          </>
        )}
      </button>
    </div>
  );
};

export default MessageInputBar;
