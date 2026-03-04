import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(token) {
    if (this.socket?.connected) {
      return this.socket;
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;

    this.socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
    });

    this.socket.on('connect', () => {
      console.log('🔌 Socket connected:', this.socket.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
    });

    this.socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  // Room methods
  joinRoom(roomId) {
    this.socket?.emit('join-room', roomId);
  }

  leaveRoom(roomId) {
    this.socket?.emit('leave-room', roomId);
  }

  sendRoomMessage(roomId, content) {
    this.socket?.emit('send-room-message', { roomId, content });
  }

  // Private chat methods
  joinPrivateChat(privateChatId) {
    this.socket?.emit('join-private-chat', privateChatId);
  }

  leavePrivateChat(privateChatId) {
    this.socket?.emit('leave-private-chat', privateChatId);
  }

  sendPrivateMessage(privateChatId, content) {
    this.socket?.emit('send-private-message', { privateChatId, content });
  }

  // Typing indicators
  startTyping(data) {
    this.socket?.emit('typing-start', data);
  }

  stopTyping(data) {
    this.socket?.emit('typing-stop', data);
  }

  // Get online users
  getOnlineUsers() {
    this.socket?.emit('get-online-users');
  }

  // Event listeners
  on(event, callback) {
    this.socket?.on(event, callback);
    
    // Store listener for cleanup
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  off(event, callback) {
    if (callback) {
      this.socket?.off(event, callback);
      this.listeners.get(event)?.delete(callback);
    } else {
      this.socket?.off(event);
      this.listeners.delete(event);
    }
  }

  // Remove all listeners for an event
  removeAllListeners(event) {
    if (event) {
      this.socket?.removeAllListeners(event);
      this.listeners.delete(event);
    } else {
      this.socket?.removeAllListeners();
      this.listeners.clear();
    }
  }

  isConnected() {
    return this.socket?.connected || false;
  }

  getSocketId() {
    return this.socket?.id;
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
