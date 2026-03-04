const express = require('express');
const prisma = require('../prismaClient');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/users
 * Get all users (for user list/search)
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { search, limit = 50, offset = 0 } = req.query;

    const where = search
      ? {
          username: {
            contains: search.toLowerCase(),
            mode: 'insensitive'
          }
        }
      : {};

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        createdAt: true
      },
      take: parseInt(limit),
      skip: parseInt(offset),
      orderBy: { username: 'asc' }
    });

    const total = await prisma.user.count({ where });

    res.json({
      users,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

/**
 * GET /api/users/:id
 * Get user by ID
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        username: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

/**
 * GET /api/users/:id/private-chats
 * Get private chats for a user
 */
router.get('/:id/private-chats', authenticate, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    // Only allow users to view their own private chats
    if (userId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const privateChats = await prisma.privateChat.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      },
      include: {
        user1: {
          select: { id: true, username: true }
        },
        user2: {
          select: { id: true, username: true }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            content: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Format response to show other user
    const formattedChats = privateChats.map(chat => ({
      id: chat.id,
      otherUser: chat.user1Id === userId ? chat.user2 : chat.user1,
      lastMessage: chat.messages[0] || null,
      createdAt: chat.createdAt
    }));

    res.json({ privateChats: formattedChats });
  } catch (error) {
    console.error('Get private chats error:', error);
    res.status(500).json({ error: 'Failed to get private chats' });
  }
});

module.exports = router;
