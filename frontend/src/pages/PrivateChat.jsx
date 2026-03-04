import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import useChatStore from '../services/chatStore';
import socketService from '../services/socket';
import Message from '../components/Message';
import MessageInput from '../components/MessageInput';
import TypingIndicator from '../components/TypingIndicator';

const PrivateChat = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  
  const { 
    currentPrivateChat,
    privateChatMessages,
    typingUsers,
    onlineUsers,
    privateChats,
    joinPrivateChat,
    leavePrivateChat,
    sendPrivateMessage,
    addPrivateMessage,
    addTypingUser,
    removeTypingUser
  } = useChatStore();

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [privateChatMessages]);

  // Join private chat on mount
  useEffect(() => {
    if (chatId) {
      joinPrivateChat(parseInt(chatId));
    }

    return () => {
      leavePrivateChat();
    };
  }, [chatId, joinPrivateChat, leavePrivateChat]);

  // Socket event listeners
  useEffect(() => {
    const handleNewMessage = (message) => {
      if (message.privateChatId === parseInt(chatId)) {
        addPrivateMessage(message);
      }
    };

    const handleUserTyping = (data) => {
      if (data.privateChatId === parseInt(chatId)) {
        addTypingUser(data);
      }
    };

    const handleUserStoppedTyping = (data) => {
      if (data.privateChatId === parseInt(chatId)) {
        removeTypingUser(data.userId);
      }
    };

    socketService.on('new-private-message', handleNewMessage);
    socketService.on('user-typing', handleUserTyping);
    socketService.on('user-stopped-typing', handleUserStoppedTyping);

    return () => {
      socketService.off('new-private-message', handleNewMessage);
      socketService.off('user-typing', handleUserTyping);
      socketService.off('user-stopped-typing', handleUserStoppedTyping);
    };
  }, [chatId, addPrivateMessage, addTypingUser, removeTypingUser]);

  const handleSendMessage = (content) => {
    sendPrivateMessage(content);
  };

  // Get chat from store if currentPrivateChat not set yet
  const chat = currentPrivateChat || privateChats.find(c => c.id === parseInt(chatId));
  const otherUser = chat?.otherUser;
  const isOnline = onlineUsers.some(u => u.id === otherUser?.id);

  if (!chat) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <MessageSquare size={48} className="mx-auto mb-4 text-gray-500" />
          <p className="text-gray-400">Chat not found</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 btn-outline"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card m-4 mb-0 p-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors lg:hidden"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-neon-purple to-neon-pink flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {otherUser?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span 
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-dark-700
                  ${isOnline ? 'bg-neon-green animate-pulse' : 'bg-gray-500'}`}
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{otherUser?.username}</h1>
              <p className={`text-sm ${isOnline ? 'text-neon-green' : 'text-gray-400'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {privateChatMessages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
              <p>No messages yet.</p>
              <p className="text-sm">Say hi to {otherUser?.username}!</p>
            </div>
          </div>
        ) : (
          privateChatMessages.map((message) => (
            <Message key={message.id} message={message} isPrivate />
          ))
        )}
        
        {/* Typing indicator */}
        <TypingIndicator users={typingUsers} />
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 pt-0">
        <MessageInput 
          onSend={handleSendMessage}
          placeholder={`Message ${otherUser?.username}`}
        />
      </div>
    </div>
  );
};

export default PrivateChat;
