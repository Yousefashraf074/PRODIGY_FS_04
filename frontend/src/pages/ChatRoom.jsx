import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Hash, ArrowLeft, Users } from 'lucide-react';
import useChatStore from '../services/chatStore';
import socketService from '../services/socket';
import Message from '../components/Message';
import MessageInput from '../components/MessageInput';
import TypingIndicator from '../components/TypingIndicator';

const ChatRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  
  const { 
    currentRoom,
    roomMessages,
    typingUsers,
    onlineUsers,
    joinRoom,
    leaveRoom,
    sendRoomMessage,
    addRoomMessage,
    addTypingUser,
    removeTypingUser,
    chatRooms
  } = useChatStore();

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [roomMessages]);

  // Join room on mount
  useEffect(() => {
    if (roomId) {
      joinRoom(parseInt(roomId));
    }

    return () => {
      leaveRoom();
    };
  }, [roomId, joinRoom, leaveRoom]);

  // Socket event listeners
  useEffect(() => {
    const handleNewMessage = (message) => {
      if (message.chatRoomId === parseInt(roomId)) {
        addRoomMessage(message);
      }
    };

    const handleUserTyping = (data) => {
      if (data.roomId === parseInt(roomId)) {
        addTypingUser(data);
      }
    };

    const handleUserStoppedTyping = (data) => {
      if (data.roomId === parseInt(roomId)) {
        removeTypingUser(data.userId);
      }
    };

    socketService.on('new-room-message', handleNewMessage);
    socketService.on('user-typing', handleUserTyping);
    socketService.on('user-stopped-typing', handleUserStoppedTyping);

    return () => {
      socketService.off('new-room-message', handleNewMessage);
      socketService.off('user-typing', handleUserTyping);
      socketService.off('user-stopped-typing', handleUserStoppedTyping);
    };
  }, [roomId, addRoomMessage, addTypingUser, removeTypingUser]);

  const handleSendMessage = (content) => {
    sendRoomMessage(content);
  };

  // Get room from store if currentRoom not set yet
  const room = currentRoom || chatRooms.find(r => r.id === parseInt(roomId));

  if (!room) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Hash size={48} className="mx-auto mb-4 text-gray-500" />
          <p className="text-gray-400">Room not found</p>
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
            <div className="p-2 rounded-lg bg-neon-blue/20">
              <Hash size={24} className="text-neon-blue" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{room.name}</h1>
              <p className="text-sm text-gray-400">
                {roomMessages.length} messages
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-gray-400">
          <Users size={18} />
          <span className="text-sm">{onlineUsers.length} online</span>
        </div>
      </motion.header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {roomMessages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Hash size={48} className="mx-auto mb-4 opacity-50" />
              <p>No messages yet.</p>
              <p className="text-sm">Be the first to say something!</p>
            </div>
          </div>
        ) : (
          roomMessages.map((message) => (
            <Message key={message.id} message={message} />
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
          placeholder={`Message #${room.name}`}
        />
      </div>
    </div>
  );
};

export default ChatRoom;
