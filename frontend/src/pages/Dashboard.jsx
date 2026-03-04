import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Hash, Users, Plus, MessageSquare, Zap } from 'lucide-react';
import useChatStore from '../services/chatStore';
import useAuthStore from '../services/authStore';
import CreateRoomModal from '../components/CreateRoomModal';
import UserList from '../components/UserList';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    chatRooms, 
    privateChats, 
    onlineUsers,
    allUsers,
    fetchChatRooms, 
    createChatRoom,
    fetchPrivateChats,
    createPrivateChat,
    fetchUsers
  } = useChatStore();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('rooms');

  useEffect(() => {
    fetchChatRooms();
    fetchUsers();
    if (user?.id) {
      fetchPrivateChats(user.id);
    }
  }, [fetchChatRooms, fetchUsers, fetchPrivateChats, user?.id]);

  const handleCreateRoom = async (name) => {
    const result = await createChatRoom(name);
    return result;
  };

  const handleStartPrivateChat = async (userId) => {
    const result = await createPrivateChat(userId);
    if (result.success) {
      navigate(`/private/${result.privateChat.id}`);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl lg:text-4xl font-bold neon-text mb-2">Dashboard</h1>
        <p className="text-gray-400">
          Welcome back, <span className="text-neon-blue">{user?.username}</span>! 
          Start chatting with your friends.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          icon={<Hash className="text-neon-blue" />}
          label="Chat Rooms"
          value={chatRooms.length}
          gradient="from-neon-blue/20 to-transparent"
        />
        <StatCard 
          icon={<MessageSquare className="text-neon-purple" />}
          label="Private Chats"
          value={privateChats.length}
          gradient="from-neon-purple/20 to-transparent"
        />
        <StatCard 
          icon={<Users className="text-neon-green" />}
          label="Online Users"
          value={onlineUsers.length}
          gradient="from-neon-green/20 to-transparent"
        />
        <StatCard 
          icon={<Zap className="text-neon-pink" />}
          label="Total Users"
          value={allUsers.length}
          gradient="from-neon-pink/20 to-transparent"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-white/10 pb-4">
        <TabButton 
          active={activeTab === 'rooms'} 
          onClick={() => setActiveTab('rooms')}
          icon={<Hash size={18} />}
          label="Chat Rooms"
        />
        <TabButton 
          active={activeTab === 'users'} 
          onClick={() => setActiveTab('users')}
          icon={<Users size={18} />}
          label="Users"
        />
        <TabButton 
          active={activeTab === 'private'} 
          onClick={() => setActiveTab('private')}
          icon={<MessageSquare size={18} />}
          label="Private Chats"
        />
      </div>

      {/* Content */}
      <div className="space-y-4">
        {activeTab === 'rooms' && (
          <>
            {/* Create Room Button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setShowCreateModal(true)}
              className="w-full glass-card p-4 border-dashed border-2 border-neon-blue/30 
                         hover:border-neon-blue/60 hover:bg-neon-blue/5 transition-all
                         flex items-center justify-center gap-2 text-neon-blue"
            >
              <Plus size={20} />
              <span>Create New Room</span>
            </motion.button>

            {/* Room List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {chatRooms.map((room, index) => (
                <RoomCard 
                  key={room.id}
                  room={room}
                  index={index}
                  onClick={() => navigate(`/room/${room.id}`)}
                />
              ))}
            </div>

            {chatRooms.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Hash size={48} className="mx-auto mb-4 opacity-50" />
                <p>No chat rooms yet. Create one to get started!</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'users' && (
          <div className="max-w-2xl">
            <UserList onStartChat={handleStartPrivateChat} />
          </div>
        )}

        {activeTab === 'private' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {privateChats.map((chat, index) => (
              <PrivateChatCard 
                key={chat.id}
                chat={chat}
                index={index}
                isOnline={onlineUsers.some(u => u.id === chat.otherUser?.id)}
                onClick={() => navigate(`/private/${chat.id}`)}
              />
            ))}

            {privateChats.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                <p>No private chats yet. Start a conversation with someone!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      <CreateRoomModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateRoom}
      />
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, label, value, gradient }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`glass-card p-6 bg-gradient-to-br ${gradient}`}
  >
    <div className="flex items-center gap-4">
      <div className="p-3 rounded-xl bg-white/5">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-gray-400">{label}</p>
      </div>
    </div>
  </motion.div>
);

// Tab Button Component
const TabButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all
      ${active 
        ? 'bg-neon-blue/20 text-neon-blue' 
        : 'text-gray-400 hover:text-white hover:bg-white/5'
      }`}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
);

// Room Card Component
const RoomCard = ({ room, index, onClick }) => (
  <motion.button
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    onClick={onClick}
    className="glass-card p-6 text-left hover:border-neon-blue/30 hover:shadow-neon/20 transition-all"
  >
    <div className="flex items-center gap-3 mb-3">
      <div className="p-2 rounded-lg bg-neon-blue/20">
        <Hash size={20} className="text-neon-blue" />
      </div>
      <h3 className="text-lg font-semibold text-white truncate">{room.name}</h3>
    </div>
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500">
        {room.messageCount || 0} messages
      </span>
      <span className="text-neon-blue text-xs">
        Join →
      </span>
    </div>
  </motion.button>
);

// Private Chat Card Component
const PrivateChatCard = ({ chat, index, isOnline, onClick }) => (
  <motion.button
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    onClick={onClick}
    className="glass-card p-6 text-left hover:border-neon-purple/30 hover:shadow-neon-purple/20 transition-all"
  >
    <div className="flex items-center gap-3 mb-3">
      <div className="relative">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-neon-purple to-neon-pink flex items-center justify-center">
          <span className="text-white font-bold text-lg">
            {chat.otherUser?.username?.charAt(0).toUpperCase()}
          </span>
        </div>
        <span 
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-dark-700
            ${isOnline ? 'bg-neon-green animate-pulse' : 'bg-gray-500'}`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-white truncate">
          {chat.otherUser?.username}
        </h3>
        <p className="text-xs text-gray-500">
          {isOnline ? 'Online' : 'Offline'}
        </p>
      </div>
    </div>
    {chat.lastMessage && (
      <p className="text-sm text-gray-400 truncate">
        {chat.lastMessage.content}
      </p>
    )}
  </motion.button>
);

export default Dashboard;
