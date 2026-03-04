const express = require('express');
const prisma = require('../prismaClient');
const { authenticate } = require('../middleware/auth');
const { validateChatRoom } = require('../middleware/validation');

const router = express.Router();

/**
 * GET /api/chatrooms
 * Get all chat rooms
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const chatRooms = await prisma.chatRoom.findMany({
      take: parseInt(limit),
      skip: parseInt(offset),
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { messages: true }
        }
      }
    });

    const total = await prisma.chatRoom.count();

    res.json({
      chatRooms: chatRooms.map(room => ({
        id: room.id,
        name: room.name,
        messageCount: room._count.messages,
        createdAt: room.createdAt
      })),
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Get chat rooms error:', error);
    res.status(500).json({ error: 'Failed to get chat rooms' });
  }
});

/**
 * GET /api/chatrooms/:id
 * Get chat room by ID
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const chatRoom = await prisma.chatRoom.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: { messages: true }
        }
      }
    });

    if (!chatRoom) {
      return res.status(404).json({ error: 'Chat room not found' });
    }

    res.json({
      chatRoom: {
        id: chatRoom.id,
        name: chatRoom.name,
        messageCount: chatRoom._count.messages,
        createdAt: chatRoom.createdAt
      }
    });
  } catch (error) {
    console.error('Get chat room error:', error);
    res.status(500).json({ error: 'Failed to get chat room' });
  }
});

/**
 * POST /api/chatrooms
 * Create a new chat room
 */
router.post('/', authenticate, validateChatRoom, async (req, res) => {
  try {
    const { name } = req.body;

    // Check if room name already exists
    const existingRoom = await prisma.chatRoom.findFirst({
      where: { name: name.trim() }
    });

    if (existingRoom) {
      return res.status(409).json({ error: 'Chat room name already exists' });
    }

    const chatRoom = await prisma.chatRoom.create({
      data: {
        name: name.trim()
      }
    });

    res.status(201).json({
      message: 'Chat room created successfully',
      chatRoom
    });
  } catch (error) {
    console.error('Create chat room error:', error);
    res.status(500).json({ error: 'Failed to create chat room' });
  }
});

/**
 * DELETE /api/chatrooms/:id
 * Delete a chat room
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const chatRoom = await prisma.chatRoom.findUnique({
      where: { id: parseInt(id) }
    });

    if (!chatRoom) {
      return res.status(404).json({ error: 'Chat room not found' });
    }

    // Delete all messages in the room first
    await prisma.message.deleteMany({
      where: { chatRoomId: parseInt(id) }
    });

    // Delete the chat room
    await prisma.chatRoom.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Chat room deleted successfully' });
  } catch (error) {
    console.error('Delete chat room error:', error);
    res.status(500).json({ error: 'Failed to delete chat room' });
  }
});

/**
 * POST /api/chatrooms/private
 * Create or get a private chat between two users
 */
router.post('/private', authenticate, async (req, res) => {
  try {
    const { userId } = req.body; // ID of the other user

    if (!userId || typeof userId !== 'number') {
      return res.status(400).json({ error: 'Valid user ID is required' });
    }

    if (userId === req.userId) {
      return res.status(400).json({ error: 'Cannot create private chat with yourself' });
    }

    // Check if other user exists
    const otherUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true }
    });

    if (!otherUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if private chat already exists
    const existingChat = await prisma.privateChat.findFirst({
      where: {
        OR: [
          { user1Id: req.userId, user2Id: userId },
          { user1Id: userId, user2Id: req.userId }
        ]
      },
      include: {
        user1: { select: { id: true, username: true } },
        user2: { select: { id: true, username: true } }
      }
    });

    if (existingChat) {
      return res.json({
        message: 'Private chat already exists',
        privateChat: {
          id: existingChat.id,
          otherUser: existingChat.user1Id === req.userId ? existingChat.user2 : existingChat.user1,
          createdAt: existingChat.createdAt
        }
      });
    }

    // Create new private chat
    const privateChat = await prisma.privateChat.create({
      data: {
        user1Id: req.userId,
        user2Id: userId
      },
      include: {
        user1: { select: { id: true, username: true } },
        user2: { select: { id: true, username: true } }
      }
    });

    res.status(201).json({
      message: 'Private chat created successfully',
      privateChat: {
        id: privateChat.id,
        otherUser: privateChat.user1Id === req.userId ? privateChat.user2 : privateChat.user1,
        createdAt: privateChat.createdAt
      }
    });
  } catch (error) {
    console.error('Create private chat error:', error);
    res.status(500).json({ error: 'Failed to create private chat' });
  }
});

module.exports = router;
