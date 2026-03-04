import { motion, AnimatePresence } from 'framer-motion';

const TypingIndicator = ({ users }) => {
  if (!users.length) return null;

  const getTypingText = () => {
    if (users.length === 1) {
      return `${users[0].username} is typing`;
    } else if (users.length === 2) {
      return `${users[0].username} and ${users[1].username} are typing`;
    } else {
      return `${users[0].username} and ${users.length - 1} others are typing`;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="flex items-center gap-3 px-4 py-2"
      >
        <div className="typing-indicator">
          <span className="typing-dot"></span>
          <span className="typing-dot"></span>
          <span className="typing-dot"></span>
        </div>
        <span className="text-sm text-gray-400">{getTypingText()}</span>
      </motion.div>
    </AnimatePresence>
  );
};

export default TypingIndicator;
