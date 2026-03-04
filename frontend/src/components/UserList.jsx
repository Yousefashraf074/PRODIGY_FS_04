import { useState } from 'react';
import { Search, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import useChatStore from '../services/chatStore';
import useAuthStore from '../services/authStore';

const UserList = ({ onStartChat }) => {
  const [search, setSearch] = useState('');
  const { allUsers, onlineUsers } = useChatStore();
  const { user } = useAuthStore();

  const filteredUsers = allUsers.filter(u => 
    u.id !== user?.id && 
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const isOnline = (userId) => onlineUsers.some(u => u.id === userId);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="input-neon pl-12"
        />
      </div>

      {/* User list */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No users found</p>
        ) : (
          filteredUsers.map((u, index) => (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card p-4 flex items-center justify-between hover:border-neon-blue/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-neon-blue to-neon-purple flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {u.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span 
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-dark-700
                      ${isOnline(u.id) ? 'bg-neon-green animate-pulse' : 'bg-gray-500'}`}
                  />
                </div>
                <div>
                  <p className="text-white font-medium">{u.username}</p>
                  <p className="text-xs text-gray-500">
                    {isOnline(u.id) ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => onStartChat(u.id)}
                className="p-2 rounded-lg bg-neon-blue/10 hover:bg-neon-blue/20 
                           text-neon-blue hover:shadow-neon transition-all"
              >
                <MessageCircle size={20} />
              </button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserList;
