const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/luma_ai',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Customer Service Database Schema
const createCustomerServiceTables = async () => {
  try {
    // Support Tickets Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        subject VARCHAR(500) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(50) NOT NULL CHECK (category IN ('technical', 'billing', 'feature', 'bug', 'general')),
        priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
        status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
        assigned_to VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        tags TEXT[] DEFAULT '{}',
        attachments TEXT[] DEFAULT '{}'
      )
    `);

    // Support Messages Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS support_messages (
        id SERIAL PRIMARY KEY,
        ticket_id INTEGER REFERENCES support_tickets(id) ON DELETE CASCADE,
        sender_id VARCHAR(255) NOT NULL,
        sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('user', 'agent', 'ai')),
        content TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_internal BOOLEAN DEFAULT FALSE,
        attachments TEXT[] DEFAULT '{}'
      )
    `);

    // Live Support Sessions Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS live_support_sessions (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        agent_id VARCHAR(255),
        status VARCHAR(20) NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'ended')),
        session_type VARCHAR(20) NOT NULL DEFAULT 'chat' CHECK (session_type IN ('chat', 'video', 'screen_share')),
        quality VARCHAR(10) NOT NULL DEFAULT '1080p' CHECK (quality IN ('1080p', '4K', '8K', '20K')),
        is_nsfw BOOLEAN DEFAULT FALSE,
        nsfw_level INTEGER DEFAULT 0,
        age_restriction INTEGER DEFAULT 0,
        content_warnings TEXT[] DEFAULT '{}',
        start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        end_time TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Customer Service Agents Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS customer_service_agents (
        id SERIAL PRIMARY KEY,
        agent_id VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        avatar VARCHAR(500),
        specialties TEXT[] DEFAULT '{}',
        languages TEXT[] DEFAULT '{}',
        online BOOLEAN DEFAULT FALSE,
        status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('available', 'busy', 'away', 'offline')),
        current_sessions INTEGER DEFAULT 0,
        max_sessions INTEGER DEFAULT 5,
        rating DECIMAL(3,2) DEFAULT 0.0,
        total_sessions INTEGER DEFAULT 0,
        response_time INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Session Messages Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS session_messages (
        id SERIAL PRIMARY KEY,
        session_id INTEGER REFERENCES live_support_sessions(id) ON DELETE CASCADE,
        sender_id VARCHAR(255) NOT NULL,
        sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('user', 'agent', 'ai')),
        content TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_internal BOOLEAN DEFAULT FALSE,
        attachments TEXT[] DEFAULT '{}'
      )
    `);

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
      CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
      CREATE INDEX IF NOT EXISTS idx_support_tickets_category ON support_tickets(category);
      CREATE INDEX IF NOT EXISTS idx_support_messages_ticket_id ON support_messages(ticket_id);
      CREATE INDEX IF NOT EXISTS idx_live_support_sessions_user_id ON live_support_sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_live_support_sessions_status ON live_support_sessions(status);
      CREATE INDEX IF NOT EXISTS idx_session_messages_session_id ON session_messages(session_id);
      CREATE INDEX IF NOT EXISTS idx_customer_service_agents_status ON customer_service_agents(status);
    `);

    console.log('Customer service tables created successfully');
  } catch (error) {
    console.error('Error creating customer service tables:', error);
  }
};

// Initialize tables
createCustomerServiceTables();

// Helper function to handle database errors
const handleDatabaseError = (error, res) => {
  console.error('Database error:', error);
  res.status(500).json({ 
    error: 'Database error occurred',
    details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
  });
};

// Helper function to validate user authentication
const validateUser = (req, res, next) => {
  const userId = req.headers['user-id'] || req.body.userId || req.query.userId;
  if (!userId) {
    return res.status(401).json({ error: 'User authentication required' });
  }
  req.userId = userId;
  next();
};

// TICKET MANAGEMENT ENDPOINTS

// Create a new support ticket
router.post('/tickets', validateUser, async (req, res) => {
  try {
    const { subject, description, category, priority, tags } = req.body;
    
    if (!subject || !description || !category || !priority) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(`
      INSERT INTO support_tickets (user_id, subject, description, category, priority, tags)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [req.userId, subject, description, category, priority, tags || []]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

// Get all tickets for a user
router.get('/tickets', validateUser, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM support_tickets 
      WHERE user_id = $1 
      ORDER BY updated_at DESC
    `, [req.userId]);

    res.json(result.rows);
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

// Get a specific ticket with messages
router.get('/tickets/:ticketId', validateUser, async (req, res) => {
  try {
    const { ticketId } = req.params;

    // Get ticket
    const ticketResult = await pool.query(`
      SELECT * FROM support_tickets WHERE id = $1 AND user_id = $2
    `, [ticketId, req.userId]);

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Get messages
    const messagesResult = await pool.query(`
      SELECT * FROM support_messages 
      WHERE ticket_id = $1 
      ORDER BY timestamp ASC
    `, [ticketId]);

    const ticket = ticketResult.rows[0];
    ticket.messages = messagesResult.rows;

    res.json(ticket);
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

// Add a message to a ticket
router.post('/tickets/:ticketId/messages', validateUser, async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { content, senderType, attachments } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Verify ticket exists and belongs to user
    const ticketResult = await pool.query(`
      SELECT id FROM support_tickets WHERE id = $1 AND user_id = $2
    `, [ticketId, req.userId]);

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Add message
    const messageResult = await pool.query(`
      INSERT INTO support_messages (ticket_id, sender_id, sender_type, content, attachments)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [ticketId, req.userId, senderType || 'user', content, attachments || []]);

    // Update ticket timestamp
    await pool.query(`
      UPDATE support_tickets SET updated_at = CURRENT_TIMESTAMP WHERE id = $1
    `, [ticketId]);

    res.status(201).json(messageResult.rows[0]);
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

// LIVE SUPPORT SESSION ENDPOINTS

// Create a new live support session
router.post('/sessions', validateUser, async (req, res) => {
  try {
    const { sessionType, quality, isNSFW, nsfwLevel, ageRestriction, contentWarnings } = req.body;

    const result = await pool.query(`
      INSERT INTO live_support_sessions (
        user_id, session_type, quality, is_nsfw, nsfw_level, 
        age_restriction, content_warnings
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      req.userId, 
      sessionType || 'chat', 
      quality || '1080p', 
      isNSFW || false, 
      nsfwLevel || 0, 
      ageRestriction || 0, 
      contentWarnings || []
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

// Get live sessions for a user
router.get('/sessions', validateUser, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM live_support_sessions 
      WHERE user_id = $1 
      ORDER BY start_time DESC
    `, [req.userId]);

    res.json(result.rows);
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

// Get a specific session with messages
router.get('/sessions/:sessionId', validateUser, async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Get session
    const sessionResult = await pool.query(`
      SELECT * FROM live_support_sessions WHERE id = $1 AND user_id = $2
    `, [sessionId, req.userId]);

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Get messages
    const messagesResult = await pool.query(`
      SELECT * FROM session_messages 
      WHERE session_id = $1 
      ORDER BY timestamp ASC
    `, [sessionId]);

    const session = sessionResult.rows[0];
    session.messages = messagesResult.rows;

    res.json(session);
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

// Add a message to a session
router.post('/sessions/:sessionId/messages', validateUser, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { content, senderType, attachments } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Verify session exists and belongs to user
    const sessionResult = await pool.query(`
      SELECT id FROM live_support_sessions WHERE id = $1 AND user_id = $2
    `, [sessionId, req.userId]);

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Add message
    const messageResult = await pool.query(`
      INSERT INTO session_messages (session_id, sender_id, sender_type, content, attachments)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [sessionId, req.userId, senderType || 'user', content, attachments || []]);

    res.status(201).json(messageResult.rows[0]);
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

// End a live support session
router.put('/sessions/:sessionId/end', validateUser, async (req, res) => {
  try {
    const { sessionId } = req.params;

    const result = await pool.query(`
      UPDATE live_support_sessions 
      SET status = 'ended', end_time = CURRENT_TIMESTAMP 
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `, [sessionId, req.userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

// AGENT MANAGEMENT ENDPOINTS

// Get all agents
router.get('/agents', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM customer_service_agents 
      ORDER BY online DESC, rating DESC
    `);

    res.json(result.rows);
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

// Get available agents
router.get('/agents/available', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM customer_service_agents 
      WHERE online = true 
      AND status = 'available' 
      AND current_sessions < max_sessions
      ORDER BY response_time ASC, rating DESC
    `);

    res.json(result.rows);
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

// Assign agent to ticket
router.put('/tickets/:ticketId/assign', validateUser, async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { agentId } = req.body;

    if (!agentId) {
      return res.status(400).json({ error: 'Agent ID is required' });
    }

    const result = await pool.query(`
      UPDATE support_tickets 
      SET assigned_to = $1, status = 'in_progress', updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND user_id = $3
      RETURNING *
    `, [agentId, ticketId, req.userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

// ANALYTICS ENDPOINTS

// Get support analytics
router.get('/analytics', validateUser, async (req, res) => {
  try {
    // Get ticket statistics
    const ticketStats = await pool.query(`
      SELECT 
        COUNT(*) as total_tickets,
        COUNT(CASE WHEN status = 'open' THEN 1 END) as open_tickets,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_tickets,
        ROUND(
          (COUNT(CASE WHEN status = 'resolved' THEN 1 END)::DECIMAL / COUNT(*)) * 100, 2
        ) as resolution_rate
      FROM support_tickets 
      WHERE user_id = $1
    `, [req.userId]);

    // Get session statistics
    const sessionStats = await pool.query(`
      SELECT 
        COUNT(*) as total_sessions,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_sessions,
        AVG(EXTRACT(EPOCH FROM (end_time - start_time))) as avg_session_duration
      FROM live_support_sessions 
      WHERE user_id = $1
    `, [req.userId]);

    // Get agent statistics
    const agentStats = await pool.query(`
      SELECT 
        COUNT(*) as total_agents,
        COUNT(CASE WHEN online = true THEN 1 END) as online_agents,
        COUNT(CASE WHEN status = 'available' THEN 1 END) as available_agents,
        AVG(rating) as avg_rating,
        AVG(response_time) as avg_response_time
      FROM customer_service_agents
    `);

    const analytics = {
      tickets: ticketStats.rows[0] || {},
      sessions: sessionStats.rows[0] || {},
      agents: agentStats.rows[0] || {}
    };

    res.json(analytics);
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

// AI SUPPORT ENDPOINTS

// Get AI response for support queries
router.post('/ai/response', validateUser, async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Simple AI response logic (in production, integrate with actual AI service)
    const lowerMessage = message.toLowerCase();
    let aiResponse = "Thank you for contacting Luma AI support! I'm here to help you with any questions about our AI features, live streaming, or app functionality. How can I assist you today?";

    if (lowerMessage.includes('live stream') || lowerMessage.includes('streaming')) {
      aiResponse = "I can help you with live streaming issues! For quality problems, try checking your internet connection and device settings. Would you like me to connect you with a live streaming specialist?";
    } else if (lowerMessage.includes('nsfw') || lowerMessage.includes('age')) {
      aiResponse = "For NSFW content and age verification issues, I can help you with the settings. Make sure you're 18+ and have proper ID verification. Would you like to speak with our NSFW content specialist?";
    } else if (lowerMessage.includes('billing') || lowerMessage.includes('payment')) {
      aiResponse = "I can assist with billing and payment questions. Please provide your account details and I'll connect you with our billing specialist.";
    } else if (lowerMessage.includes('bug') || lowerMessage.includes('error')) {
      aiResponse = "I'm sorry to hear you're experiencing issues. Let me gather some information about the bug and connect you with our technical support team.";
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    res.json({ 
      response: aiResponse,
      confidence: 0.85,
      suggestedActions: ['create_ticket', 'live_support', 'knowledge_base']
    });
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

// HEALTH CHECK
router.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'customer-service',
    timestamp: new Date().toISOString()
  });
});

module.exports = router; 