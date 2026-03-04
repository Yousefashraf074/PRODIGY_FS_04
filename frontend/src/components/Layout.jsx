import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { LogOut, MessageSquare, Users, Home, Menu, X } from 'lucide-react';
import useAuthStore from '../services/authStore';
import useChatStore from '../services/chatStore';
import socketService from '../services/socket';

const Layout = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { onlineUsers, setOnlineUsers, chatRooms, fetchChatRooms, privateChats, fetchPrivateChats } = useChatStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Initialize socket listeners
    socketService.on('online-users', (data) => {
      setOnlineUsers(data.users);
    });

    // Request initial online users
    socketService.getOnlineUsers();

    // Fetch initial data
    fetchChatRooms();
    if (user?.id) {
      fetchPrivateChats(user.id);
    }

    return () => {
      socketService.off('online-users');
    };
  }, [user?.id, setOnlineUsers, fetchChatRooms, fetchPrivateChats]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-dark-700/50 backdrop-blur-lg border border-white/10"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-72 bg-dark-800/50 backdrop-blur-xl border-r border-white/5
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-white/5">
            <h1 className="text-2xl font-bold neon-text">Neon Chat</h1>
            <p className="text-sm text-gray-400 mt-1">Welcome, {user?.username}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Dashboard link */}
            <button
              onClick={() => { navigate('/dashboard'); setSidebarOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg
                         text-gray-300 hover:text-white hover:bg-white/5 transition-all"
            >
              <Home size={20} />
              <span>Dashboard</span>
            </button>

            {/* Chat Rooms */}
            <div>
              <h3 className="text-xs uppercase text-gray-500 font-semibold mb-3 px-4 flex items-center gap-2">
                <MessageSquare size={14} />
                Chat Rooms
              </h3>
              <div className="space-y-1">
                {chatRooms.slice(0, 5).map((room) => (
                  <button
                    key={room.id}
                    onClick={() => { navigate(`/room/${room.id}`); setSidebarOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2 rounded-lg
                               text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm"
                  >
                    <span className="w-2 h-2 rounded-full bg-neon-blue/50"></span>
                    <span className="truncate">{room.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Private Chats */}
            <div>
              <h3 className="text-xs uppercase text-gray-500 font-semibold mb-3 px-4 flex items-center gap-2">
                <Users size={14} />
                Private Chats
              </h3>
              <div className="space-y-1">
                {privateChats.slice(0, 5).map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => { navigate(`/private/${chat.id}`); setSidebarOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2 rounded-lg
                               text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm"
                  >
                    <span className={`w-2 h-2 rounded-full ${
                      onlineUsers.some(u => u.id === chat.otherUser?.id) 
                        ? 'bg-neon-green animate-pulse' 
                        : 'bg-gray-500'
                    }`}></span>
                    <span className="truncate">{chat.otherUser?.username}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Online Users */}
            <div>
              <h3 className="text-xs uppercase text-gray-500 font-semibold mb-3 px-4 flex items-center gap-2">
                <span className="online-indicator w-2 h-2"></span>
                Online ({onlineUsers.length})
              </h3>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {onlineUsers.map((onlineUser) => (
                  <div
                    key={onlineUser.id}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-400"
                  >
                    <span className="online-indicator w-2 h-2"></span>
                    <span className="truncate">
                      {onlineUser.username}
                      {onlineUser.id === user?.id && ' (you)'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-white/5">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg
                         text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
