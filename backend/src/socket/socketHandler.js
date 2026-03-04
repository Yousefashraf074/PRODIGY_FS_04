const { authenticateSocket } = require('../middleware/auth');
const prisma = require('../prismaClient');

// Store online users: Map<socketId, { userId, username }>
const onlineUsers = new Map();
// Store user to socket mapping: Map<userId, Set<socketId>>
const userSockets = new Map();

/**
 * Initialize Socket.IO handlers
 */
const initializeSocket = (io, activeConnectionsGauge) => {
  // Use authentication middleware
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    const { id: userId, username } = socket.user;
    
    console.log(`🔌 User connected: ${username} (${socket.id})`);
    
    // Track online user
    onlineUsers.set(socket.id, { userId, username });
    
    // Track user's sockets (for multiple device support)
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);
    
    // Update metrics
    if (activeConnectionsGauge) {
      activeConnectionsGauge.set(onlineUsers.size);
    }

    // Broadcast updated online users list
    broadcastOnlineUsers(io);

    // Handle joining a chat room
    socket.on('join-room', async (roomId) => {
      try {
        const room = await prisma.chatRoom.findUnique({
          where: { id: parseInt(roomId) }
        });

        if (!room) {
          socket.emit('error', { message: 'Chat room not found' });
          return;
        }

        const roomName = `room-${roomId}`;
        socket.join(roomName);
        
        console.log(`👤 ${username} joined room: ${room.name}`);
        
        // Notify room members
        socket.to(roomName).emit('user-joined', {
          userId,
          username,
          roomId: parseInt(roomId),
          timestamp: new Date().toISOString()
        });

        socket.emit('joined-room', {
          roomId: parseInt(roomId),
          roomName: room.name
        });
      } catch (error) {
        console.error('Join room error:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Handle leaving a chat room
    socket.on('leave-room', (roomId) => {
      const roomName = `room-${roomId}`;
      socket.leave(roomName);
      
      console.log(`👤 ${username} left room: ${roomId}`);
      
      // Notify room members
      socket.to(roomName).emit('user-left', {
        userId,
        username,
        roomId: parseInt(roomId),
        timestamp: new Date().toISOString()
      });
    });

    // Handle sending a message to a room
    socket.on('send-room-message', async (data) => {
      try {
        const { roomId, content } = data;

        if (!content || content.trim().length === 0) {
          socket.emit('error', { message: 'Message content is required' });
          return;
        }

        if (content.length > 2000) {
          socket.emit('error', { message: 'Message too long' });
          return;
        }

        // Save message to database
        const message = await prisma.message.create({
          data: {
            content: content.trim(),
            userId,
            chatRoomId: parseInt(roomId)
          },
          include: {
            user: {
              select: { id: true, username: true }
            }
          }
        });

        const roomName = `room-${roomId}`;
        
        // Emit to everyone in the room including sender
        io.to(roomName).emit('new-room-message', {
          id: message.id,
          content: message.content,
          user: message.user,
          chatRoomId: message.chatRoomId,
          createdAt: message.createdAt
        });

        console.log(`💬 Message in room ${roomId} from ${username}: ${content.substring(0, 50)}...`);
      } catch (error) {
        console.error('Send room message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle joining a private chat
    socket.on('join-private-chat', async (privateChatId) => {
      try {
        const privateChat = await prisma.privateChat.findUnique({
          where: { id: parseInt(privateChatId) }
        });

        if (!privateChat) {
          socket.emit('error', { message: 'Private chat not found' });
          return;
        }

        // Verify user is part of this chat
        if (privateChat.user1Id !== userId && privateChat.user2Id !== userId) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        const chatName = `private-${privateChatId}`;
        socket.join(chatName);
        
        console.log(`👤 ${username} joined private chat: ${privateChatId}`);

        socket.emit('joined-private-chat', { privateChatId: parseInt(privateChatId) });
      } catch (error) {
        console.error('Join private chat error:', error);
        socket.emit('error', { message: 'Failed to join private chat' });
      }
    });

    // Handle leaving a private chat
    socket.on('leave-private-chat', (privateChatId) => {
      const chatName = `private-${privateChatId}`;
      socket.leave(chatName);
      console.log(`👤 ${username} left private chat: ${privateChatId}`);
    });

    // Handle sending a private message
    socket.on('send-private-message', async (data) => {
      try {
        const { privateChatId, content } = data;

        if (!content || content.trim().length === 0) {
          socket.emit('error', { message: 'Message content is required' });
          return;
        }

        if (content.length > 2000) {
          socket.emit('error', { message: 'Message too long' });
          return;
        }

        // Verify user has access
        const privateChat = await prisma.privateChat.findUnique({
          where: { id: parseInt(privateChatId) }
        });

        if (!privateChat || (privateChat.user1Id !== userId && privateChat.user2Id !== userId)) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        // Save message to database
        const message = await prisma.message.create({
          data: {
            content: content.trim(),
            userId,
            privateChatId: parseInt(privateChatId)
          },
          include: {
            user: {
              select: { id: true, username: true }
            }
          }
        });

        const chatName = `private-${privateChatId}`;
        
        // Emit to everyone in the private chat
        io.to(chatName).emit('new-private-message', {
          id: message.id,
          content: message.content,
          user: message.user,
          privateChatId: message.privateChatId,
          createdAt: message.createdAt
        });

        // Also send notification to other user if they're online but not in the chat
        const otherUserId = privateChat.user1Id === userId ? privateChat.user2Id : privateChat.user1Id;
        const otherUserSockets = userSockets.get(otherUserId);
        
        if (otherUserSockets) {
          otherUserSockets.forEach(socketId => {
            const otherSocket = io.sockets.sockets.get(socketId);
            if (otherSocket && !otherSocket.rooms.has(chatName)) {
              otherSocket.emit('private-message-notification', {
                privateChatId: parseInt(privateChatId),
                from: { id: userId, username },
                preview: content.substring(0, 50)
              });
            }
          });
        }

        console.log(`💬 Private message from ${username}: ${content.substring(0, 50)}...`);
      } catch (error) {
        console.error('Send private message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing-start', (data) => {
      const { roomId, privateChatId } = data;
      
      if (roomId) {
        const roomName = `room-${roomId}`;
        socket.to(roomName).emit('user-typing', {
          userId,
          username,
          roomId: parseInt(roomId)
        });
      } else if (privateChatId) {
        const chatName = `private-${privateChatId}`;
        socket.to(chatName).emit('user-typing', {
          userId,
          username,
          privateChatId: parseInt(privateChatId)
        });
      }
    });

    socket.on('typing-stop', (data) => {
      const { roomId, privateChatId } = data;
      
      if (roomId) {
        const roomName = `room-${roomId}`;
        socket.to(roomName).emit('user-stopped-typing', {
          userId,
          username,
          roomId: parseInt(roomId)
        });
      } else if (privateChatId) {
        const chatName = `private-${privateChatId}`;
        socket.to(chatName).emit('user-stopped-typing', {
          userId,
          username,
          privateChatId: parseInt(privateChatId)
        });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${username} (${socket.id})`);
      
      // Remove from online users
      onlineUsers.delete(socket.id);
      
      // Remove from user sockets
      if (userSockets.has(userId)) {
        userSockets.get(userId).delete(socket.id);
        if (userSockets.get(userId).size === 0) {
          userSockets.delete(userId);
        }
      }
      
      // Update metrics
      if (activeConnectionsGauge) {
        activeConnectionsGauge.set(onlineUsers.size);
      }

      // Broadcast updated online users list
      broadcastOnlineUsers(io);

      // Notify all rooms user was in
      socket.rooms.forEach(room => {
        if (room !== socket.id) {
          socket.to(room).emit('user-left', {
            userId,
            username,
            timestamp: new Date().toISOString()
          });
        }
      });
    });

    // Handle getting online users
    socket.on('get-online-users', () => {
      const users = getUniqueOnlineUsers();
      socket.emit('online-users', { users });
    });
  });
};

/**
 * Get unique online users (deduplicated by userId)
 */
const getUniqueOnlineUsers = () => {
  const uniqueUsers = new Map();
  
  onlineUsers.forEach(({ userId, username }) => {
    if (!uniqueUsers.has(userId)) {
      uniqueUsers.set(userId, { id: userId, username });
    }
  });
  
  return Array.from(uniqueUsers.values());
};

/**
 * Broadcast online users to all connected clients
 */
const broadcastOnlineUsers = (io) => {
  const users = getUniqueOnlineUsers();
  io.emit('online-users', { users });
};

module.exports = {
  initializeSocket,
  onlineUsers,
  userSockets
};
