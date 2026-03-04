import { create } from 'zustand';
import { chatRoomsAPI, messagesAPI, usersAPI } from '../services/api';
import socketService from '../services/socket';

const useChatStore = create((set, get) => ({
  // Chat rooms
  chatRooms: [],
  currentRoom: null,
  roomMessages: [],
  
  // Private chats
  privateChats: [],
  currentPrivateChat: null,
  privateChatMessages: [],
  
  // Users
  onlineUsers: [],
  allUsers: [],
  
  // UI state
  typingUsers: [],
  isLoading: false,
  error: null,

  // Fetch chat rooms
  fetchChatRooms: async () => {
    set({ isLoading: true });
    try {
      const response = await chatRoomsAPI.getAll();
      set({ chatRooms: response.data.chatRooms, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch chat rooms', isLoading: false });
    }
  },

  // Create chat room
  createChatRoom: async (name) => {
    try {
      const response = await chatRoomsAPI.create({ name });
      const newRoom = response.data.chatRoom;
      set(state => ({ chatRooms: [newRoom, ...state.chatRooms] }));
      return { success: true, room: newRoom };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Failed to create room' };
    }
  },

  // Join room
  joinRoom: async (roomId) => {
    const room = get().chatRooms.find(r => r.id === roomId);
    if (room) {
      set({ currentRoom: room, roomMessages: [], typingUsers: [] });
      socketService.joinRoom(roomId);
      
      // Fetch history
      try {
        const response = await messagesAPI.getByChat(roomId, { type: 'room' });
        set({ roomMessages: response.data.messages });
      } catch (error) {
        console.error('Failed to fetch room messages:', error);
      }
    }
  },

  // Leave room
  leaveRoom: () => {
    const currentRoom = get().currentRoom;
    if (currentRoom) {
      socketService.leaveRoom(currentRoom.id);
      set({ currentRoom: null, roomMessages: [], typingUsers: [] });
    }
  },

  // Add room message
  addRoomMessage: (message) => {
    set(state => ({
      roomMessages: [...state.roomMessages, message]
    }));
  },

  // Send room message
  sendRoomMessage: (content) => {
    const currentRoom = get().currentRoom;
    if (currentRoom) {
      socketService.sendRoomMessage(currentRoom.id, content);
    }
  },

  // Fetch private chats
  fetchPrivateChats: async (userId) => {
    try {
      const response = await usersAPI.getPrivateChats(userId);
      set({ privateChats: response.data.privateChats });
    } catch (error) {
      console.error('Failed to fetch private chats:', error);
    }
  },

  // Create or get private chat
  createPrivateChat: async (userId) => {
    try {
      const response = await chatRoomsAPI.createPrivate(userId);
      const privateChat = response.data.privateChat;
      
      // Add to list if new
      set(state => {
        const exists = state.privateChats.some(pc => pc.id === privateChat.id);
        if (!exists) {
          return { privateChats: [privateChat, ...state.privateChats] };
        }
        return state;
      });
      
      return { success: true, privateChat };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Failed to create private chat' };
    }
  },

  // Join private chat
  joinPrivateChat: async (privateChatId) => {
    const chat = get().privateChats.find(pc => pc.id === privateChatId);
    if (chat) {
      set({ currentPrivateChat: chat, privateChatMessages: [], typingUsers: [] });
      socketService.joinPrivateChat(privateChatId);
      
      // Fetch history
      try {
        const response = await messagesAPI.getByChat(privateChatId, { type: 'private' });
        set({ privateChatMessages: response.data.messages });
      } catch (error) {
        console.error('Failed to fetch private messages:', error);
      }
    }
  },

  // Leave private chat
  leavePrivateChat: () => {
    const currentPrivateChat = get().currentPrivateChat;
    if (currentPrivateChat) {
      socketService.leavePrivateChat(currentPrivateChat.id);
      set({ currentPrivateChat: null, privateChatMessages: [], typingUsers: [] });
    }
  },

  // Add private message
  addPrivateMessage: (message) => {
    set(state => ({
      privateChatMessages: [...state.privateChatMessages, message]
    }));
  },

  // Send private message
  sendPrivateMessage: (content) => {
    const currentPrivateChat = get().currentPrivateChat;
    if (currentPrivateChat) {
      socketService.sendPrivateMessage(currentPrivateChat.id, content);
    }
  },

  // Fetch all users
  fetchUsers: async () => {
    try {
      const response = await usersAPI.getAll();
      set({ allUsers: response.data.users });
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  },

  // Set online users
  setOnlineUsers: (users) => {
    set({ onlineUsers: users });
  },

  // Add typing user
  addTypingUser: (user) => {
    set(state => {
      if (!state.typingUsers.some(u => u.userId === user.userId)) {
        return { typingUsers: [...state.typingUsers, user] };
      }
      return state;
    });
  },

  // Remove typing user
  removeTypingUser: (userId) => {
    set(state => ({
      typingUsers: state.typingUsers.filter(u => u.userId !== userId)
    }));
  },

  // Clear typing users
  clearTypingUsers: () => {
    set({ typingUsers: [] });
  },

  // Start typing
  startTyping: () => {
    const { currentRoom, currentPrivateChat } = get();
    if (currentRoom) {
      socketService.startTyping({ roomId: currentRoom.id });
    } else if (currentPrivateChat) {
      socketService.startTyping({ privateChatId: currentPrivateChat.id });
    }
  },

  // Stop typing
  stopTyping: () => {
    const { currentRoom, currentPrivateChat } = get();
    if (currentRoom) {
      socketService.stopTyping({ roomId: currentRoom.id });
    } else if (currentPrivateChat) {
      socketService.stopTyping({ privateChatId: currentPrivateChat.id });
    }
  },

  // Clear error
  clearError: () => set({ error: null })
}));

export default useChatStore;
