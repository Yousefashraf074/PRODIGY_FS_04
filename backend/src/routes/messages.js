const express = require('express');
const prisma = require('../prismaClient');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/messages/:chatId
 * Get messages for a chat room or private chat
 */
router.get('/:chatId', authenticate, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { type = 'room', limit = 50, before } = req.query;

    const limitNum = parseInt(limit);

    if (type === 'room') {
      // Get messages from a chat room
      const chatRoom = await prisma.chatRoom.findUnique({
        where: { id: parseInt(chatId) }
      });

      if (!chatRoom) {
        return res.status(404).json({ error: 'Chat room not found' });
      }

      const whereClause = {
        chatRoomId: parseInt(chatId)
      };

      if (before) {
        whereClause.createdAt = { lt: new Date(before) };
      }

      const messages = await prisma.message.findMany({
        where: whereClause,
        include: {
          user: {
            select: { id: true, username: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limitNum
      });

      // Reverse to get chronological order
      res.json({ messages: messages.reverse() });

    } else if (type === 'private') {
      // Get messages from a private chat
      const privateChat = await prisma.privateChat.findUnique({
        where: { id: parseInt(chatId) }
      });

      if (!privateChat) {
        return res.status(404).json({ error: 'Private chat not found' });
      }

      // Verify user is part of this private chat
      if (privateChat.user1Id !== req.userId && privateChat.user2Id !== req.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const whereClause = {
        privateChatId: parseInt(chatId)
      };

      if (before) {
        whereClause.createdAt = { lt: new Date(before) };
      }

      const messages = await prisma.message.findMany({
        where: whereClause,
        include: {
          user: {
            select: { id: true, username: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limitNum
      });

      res.json({ messages: messages.reverse() });
    } else {
      res.status(400).json({ error: 'Invalid chat type. Use "room" or "private"' });
    }
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

/**
 * POST /api/messages/:chatId
 * Send a message to a chat room or private chat (REST fallback)
 */
router.post('/:chatId', authenticate, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { type = 'room', content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    if (content.length > 2000) {
      return res.status(400).json({ error: 'Message too long' });
    }

    let message;

    if (type === 'room') {
      const chatRoom = await prisma.chatRoom.findUnique({
        where: { id: parseInt(chatId) }
      });

      if (!chatRoom) {
        return res.status(404).json({ error: 'Chat room not found' });
      }

      message = await prisma.message.create({
        data: {
          content: content.trim(),
          userId: req.userId,
          chatRoomId: parseInt(chatId)
        },
        include: {
          user: {
            select: { id: true, username: true }
          }
        }
      });
    } else if (type === 'private') {
      const privateChat = await prisma.privateChat.findUnique({
        where: { id: parseInt(chatId) }
      });

      if (!privateChat) {
        return res.status(404).json({ error: 'Private chat not found' });
      }

      if (privateChat.user1Id !== req.userId && privateChat.user2Id !== req.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      message = await prisma.message.create({
        data: {
          content: content.trim(),
          userId: req.userId,
          privateChatId: parseInt(chatId)
        },
        include: {
          user: {
            select: { id: true, username: true }
          }
        }
      });
    } else {
      return res.status(400).json({ error: 'Invalid chat type' });
    }

    res.status(201).json({ message });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

module.exports = router;
