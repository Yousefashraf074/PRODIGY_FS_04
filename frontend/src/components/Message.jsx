import { format } from 'date-fns';
import { motion } from 'framer-motion';
import useAuthStore from '../services/authStore';

const Message = ({ message, isPrivate = false }) => {
  const { user } = useAuthStore();
  const isOwn = message.user?.id === user?.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`message-bubble ${isOwn ? 'message-bubble-own' : 'message-bubble-other'}`}>
        {/* Username and time */}
        <div className={`flex items-center gap-2 mb-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span className={`text-xs font-medium ${isOwn ? 'text-neon-blue' : 'text-neon-purple'}`}>
            {isOwn ? 'You' : message.user?.username}
          </span>
          <span className="text-xs text-gray-500">
            {format(new Date(message.createdAt), 'HH:mm')}
          </span>
        </div>

        {/* Message content */}
        <p className="text-white/90 break-words whitespace-pre-wrap">
          {message.content}
        </p>
      </div>
    </motion.div>
  );
};

export default Message;
