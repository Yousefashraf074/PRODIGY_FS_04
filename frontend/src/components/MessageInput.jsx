import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import useChatStore from '../services/chatStore';

const MessageInput = ({ onSend, placeholder = "Type a message..." }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);
  const { startTyping, stopTyping } = useChatStore();

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  const handleChange = (e) => {
    setMessage(e.target.value);

    // Handle typing indicator
    if (!isTyping) {
      setIsTyping(true);
      startTyping();
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      stopTyping();
    }, 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (message.trim()) {
      onSend(message.trim());
      setMessage('');
      
      // Clear typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      setIsTyping(false);
      stopTyping();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex items-end gap-3 p-4 glass rounded-2xl">
        <textarea
          ref={inputRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          className="flex-1 input-neon resize-none min-h-[48px] max-h-32 py-3"
          style={{ height: 'auto' }}
          onInput={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`;
          }}
        />
        
        <button
          type="submit"
          disabled={!message.trim()}
          className={`
            p-3 rounded-xl transition-all duration-300
            ${message.trim() 
              ? 'bg-gradient-to-r from-neon-blue to-neon-purple shadow-neon hover:shadow-neon-lg hover:scale-105' 
              : 'bg-gray-700/50 cursor-not-allowed'
            }
          `}
        >
          <Send size={20} className={message.trim() ? 'text-white' : 'text-gray-500'} />
        </button>
      </div>
    </form>
  );
};

export default MessageInput;
