const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Middleware to verify authentication
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// Create a new live stream
router.post('/create', authenticateUser, async (req, res) => {
  try {
    const {
      title,
      description,
      quality,
      bitrate,
      enableAI,
      enableHDR,
      enableRayTracing,
      privacy,
      category,
      tags,
      isNSFW,
      nsfwLevel,
      ageRestriction,
      contentWarnings
    } = req.body;

    if (!title || !quality || !bitrate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // NSFW validation and rules enforcement
    if (isNSFW) {
      const validationResult = validateNSFWContent({
        isNSFW,
        nsfwLevel,
        ageRestriction,
        contentWarnings,
        privacy,
        category
      });
      if (!validationResult.isValid) {
        return res.status(400).json({ error: validationResult.reason });
      }
    }

    const streamKey = `luma_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const { data, error } = await supabase
      .from('live_streams')
      .insert([
        {
          id: uuidv4(),
          user_id: req.user.id,
          title,
          description,
          quality,
          bitrate,
          is_live: false,
          viewers: 0,
          peak_viewers: 0,
          duration: 0,
          stream_key: streamKey,
          privacy: privacy || 'public',
          category: category || 'general',
          tags: tags || [],
          is_nsfw: isNSFW || false,
          nsfw_level: nsfwLevel,
          age_restriction: ageRestriction || (isNSFW ? 18 : 13),
          content_warnings: contentWarnings || (isNSFW ? ['adult-content'] : []),
          ai_features: {
            enabled: enableAI || false,
            realTimeEnhancement: enableAI || false,
            autoModeration: enableAI || false,
            viewerAnalytics: enableAI || false
          },
          analytics: {
            totalViews: 0,
            uniqueViewers: 0,
            averageWatchTime: 0,
            engagementRate: 0,
            chatMessages: 0,
            reactions: 0
          }
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to create live stream' });
    }

    res.json({
      success: true,
      stream: data,
      streamKey: streamKey
    });
  } catch (error) {
    console.error('Create live stream error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start a live stream
router.post('/start/:streamId', authenticateUser, async (req, res) => {
  try {
    const { streamId } = req.params;

    // Verify stream ownership
    const { data: stream, error: fetchError } = await supabase
      .from('live_streams')
      .select('*')
      .eq('id', streamId)
      .eq('user_id', req.user.id)
      .single();

    if (fetchError || !stream) {
      return res.status(404).json({ error: 'Stream not found or access denied' });
    }

    if (stream.is_live) {
      return res.status(400).json({ error: 'Stream is already live' });
    }

    // Update stream to live
    const { data, error } = await supabase
      .from('live_streams')
      .update({
        is_live: true,
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', streamId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to start live stream' });
    }

    // Create stream event
    await supabase
      .from('live_stream_events')
      .insert([
        {
          id: uuidv4(),
          stream_id: streamId,
          event_type: 'started',
          event_data: {
            quality: data.quality,
            bitrate: data.bitrate,
            aiFeatures: data.ai_features,
            timestamp: new Date().toISOString()
          }
        }
      ]);

    res.json({
      success: true,
      stream: data
    });
  } catch (error) {
    console.error('Start live stream error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// End a live stream
router.post('/end/:streamId', authenticateUser, async (req, res) => {
  try {
    const { streamId } = req.params;

    // Verify stream ownership
    const { data: stream, error: fetchError } = await supabase
      .from('live_streams')
      .select('*')
      .eq('id', streamId)
      .eq('user_id', req.user.id)
      .single();

    if (fetchError || !stream) {
      return res.status(404).json({ error: 'Stream not found or access denied' });
    }

    if (!stream.is_live) {
      return res.status(400).json({ error: 'Stream is not live' });
    }

    // Calculate duration
    const startedAt = new Date(stream.started_at);
    const endedAt = new Date();
    const duration = Math.floor((endedAt - startedAt) / 1000);

    // Update stream
    const { data, error } = await supabase
      .from('live_streams')
      .update({
        is_live: false,
        ended_at: endedAt.toISOString(),
        duration: duration,
        updated_at: endedAt.toISOString()
      })
      .eq('id', streamId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to end live stream' });
    }

    // Create stream event
    await supabase
      .from('live_stream_events')
      .insert([
        {
          id: uuidv4(),
          stream_id: streamId,
          event_type: 'ended',
          event_data: {
            duration: duration,
            peakViewers: data.peak_viewers,
            totalViews: data.analytics.total_views,
            timestamp: endedAt.toISOString()
          }
        }
      ]);

    res.json({
      success: true,
      stream: data,
      analytics: {
        duration: duration,
        peakViewers: data.peak_viewers,
        totalViews: data.analytics.total_views
      }
    });
  } catch (error) {
    console.error('End live stream error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get live streams
router.get('/live', async (req, res) => {
  try {
    const { category, limit = 20, offset = 0 } = req.query;

    let query = supabase
      .from('live_streams')
      .select(`
        *,
        users:user_id (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('is_live', true)
      .order('viewers', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to fetch live streams' });
    }

    res.json({
      success: true,
      streams: data,
      count: data.length
    });
  } catch (error) {
    console.error('Get live streams error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific live stream
router.get('/:streamId', async (req, res) => {
  try {
    const { streamId } = req.params;

    const { data, error } = await supabase
      .from('live_streams')
      .select(`
        *,
        users:user_id (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('id', streamId)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Stream not found' });
    }

    res.json({
      success: true,
      stream: data
    });
  } catch (error) {
    console.error('Get stream error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Join live stream (increment viewer count)
router.post('/:streamId/join', authenticateUser, async (req, res) => {
  try {
    const { streamId } = req.params;

    // Check if stream exists and is live
    const { data: stream, error: fetchError } = await supabase
      .from('live_streams')
      .select('*')
      .eq('id', streamId)
      .eq('is_live', true)
      .single();

    if (fetchError || !stream) {
      return res.status(404).json({ error: 'Live stream not found' });
    }

    // Increment viewer count
    const newViewers = stream.viewers + 1;
    const newPeakViewers = Math.max(stream.peak_viewers, newViewers);

    const { data, error } = await supabase
      .from('live_streams')
      .update({
        viewers: newViewers,
        peak_viewers: newPeakViewers,
        updated_at: new Date().toISOString()
      })
      .eq('id', streamId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to join stream' });
    }

    // Create join event
    await supabase
      .from('live_stream_events')
      .insert([
        {
          id: uuidv4(),
          stream_id: streamId,
          event_type: 'viewer_joined',
          event_data: {
            userId: req.user.id,
            timestamp: new Date().toISOString()
          }
        }
      ]);

    res.json({
      success: true,
      stream: data
    });
  } catch (error) {
    console.error('Join stream error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Leave live stream (decrement viewer count)
router.post('/:streamId/leave', authenticateUser, async (req, res) => {
  try {
    const { streamId } = req.params;

    // Check if stream exists and is live
    const { data: stream, error: fetchError } = await supabase
      .from('live_streams')
      .select('*')
      .eq('id', streamId)
      .eq('is_live', true)
      .single();

    if (fetchError || !stream) {
      return res.status(404).json({ error: 'Live stream not found' });
    }

    // Decrement viewer count
    const newViewers = Math.max(0, stream.viewers - 1);

    const { data, error } = await supabase
      .from('live_streams')
      .update({
        viewers: newViewers,
        updated_at: new Date().toISOString()
      })
      .eq('id', streamId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to leave stream' });
    }

    // Create leave event
    await supabase
      .from('live_stream_events')
      .insert([
        {
          id: uuidv4(),
          stream_id: streamId,
          event_type: 'viewer_left',
          event_data: {
            userId: req.user.id,
            timestamp: new Date().toISOString()
          }
        }
      ]);

    res.json({
      success: true,
      stream: data
    });
  } catch (error) {
    console.error('Leave stream error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send chat message
router.post('/:streamId/chat', authenticateUser, async (req, res) => {
  try {
    const { streamId } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Check if stream exists and is live
    const { data: stream, error: fetchError } = await supabase
      .from('live_streams')
      .select('*')
      .eq('id', streamId)
      .eq('is_live', true)
      .single();

    if (fetchError || !stream) {
      return res.status(404).json({ error: 'Live stream not found' });
    }

    // Create chat message event
    const { data: event, error: eventError } = await supabase
      .from('live_stream_events')
      .insert([
        {
          id: uuidv4(),
          stream_id: streamId,
          event_type: 'chat_message',
          event_data: {
            userId: req.user.id,
            message: message.trim(),
            timestamp: new Date().toISOString()
          }
        }
      ])
      .select()
      .single();

    if (eventError) {
      console.error('Event creation error:', eventError);
      return res.status(500).json({ error: 'Failed to send message' });
    }

    // Increment chat messages count
    await supabase
      .from('live_streams')
      .update({
        analytics: {
          ...stream.analytics,
          chatMessages: (stream.analytics.chatMessages || 0) + 1
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', streamId);

    res.json({
      success: true,
      message: event
    });
  } catch (error) {
    console.error('Send chat message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send reaction
router.post('/:streamId/reaction', authenticateUser, async (req, res) => {
  try {
    const { streamId } = req.params;
    const { reaction } = req.body;

    if (!reaction) {
      return res.status(400).json({ error: 'Reaction is required' });
    }

    // Check if stream exists and is live
    const { data: stream, error: fetchError } = await supabase
      .from('live_streams')
      .select('*')
      .eq('id', streamId)
      .eq('is_live', true)
      .single();

    if (fetchError || !stream) {
      return res.status(404).json({ error: 'Live stream not found' });
    }

    // Create reaction event
    const { data: event, error: eventError } = await supabase
      .from('live_stream_events')
      .insert([
        {
          id: uuidv4(),
          stream_id: streamId,
          event_type: 'reaction',
          event_data: {
            userId: req.user.id,
            reaction: reaction,
            timestamp: new Date().toISOString()
          }
        }
      ])
      .select()
      .single();

    if (eventError) {
      console.error('Event creation error:', eventError);
      return res.status(500).json({ error: 'Failed to send reaction' });
    }

    // Increment reactions count
    await supabase
      .from('live_streams')
      .update({
        analytics: {
          ...stream.analytics,
          reactions: (stream.analytics.reactions || 0) + 1
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', streamId);

    res.json({
      success: true,
      reaction: event
    });
  } catch (error) {
    console.error('Send reaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get stream events
router.get('/:streamId/events', async (req, res) => {
  try {
    const { streamId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const { data, error } = await supabase
      .from('live_stream_events')
      .select('*')
      .eq('stream_id', streamId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to fetch stream events' });
    }

    res.json({
      success: true,
      events: data,
      count: data.length
    });
  } catch (error) {
    console.error('Get stream events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's live streams
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const { data, error } = await supabase
      .from('live_streams')
      .select(`
        *,
        users:user_id (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to fetch user streams' });
    }

    res.json({
      success: true,
      streams: data,
      count: data.length
    });
  } catch (error) {
    console.error('Get user streams error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get stream analytics
router.get('/:streamId/analytics', authenticateUser, async (req, res) => {
  try {
    const { streamId } = req.params;

    // Verify stream ownership
    const { data: stream, error: fetchError } = await supabase
      .from('live_streams')
      .select('*')
      .eq('id', streamId)
      .eq('user_id', req.user.id)
      .single();

    if (fetchError || !stream) {
      return res.status(404).json({ error: 'Stream not found or access denied' });
    }

    // Get recent events for additional analytics
    const { data: events } = await supabase
      .from('live_stream_events')
      .select('*')
      .eq('stream_id', streamId)
      .order('created_at', { ascending: false })
      .limit(100);

    const analytics = {
      ...stream.analytics,
      totalEvents: events?.length || 0,
      chatMessages: events?.filter(e => e.event_type === 'chat_message').length || 0,
      reactions: events?.filter(e => e.event_type === 'reaction').length || 0,
      uniqueViewers: stream.peak_viewers, // Simplified for now
      averageWatchTime: stream.duration || 0
    };

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// NSFW validation function
function validateNSFWContent(config) {
  // NSFW Rules for Luma Gen 1 - Girls can be naked but must follow rules
  const rules = {
    ageRestriction: 18,
    requiredWarnings: ['adult-content', 'explicit-material', 'nudity'],
    prohibitedContent: ['illegal-activities', 'harmful-content', 'non-consensual', 'minors'],
    qualityStandards: ['professional-production', 'consent-verified', 'age-verified'],
    allowedCategories: ['adult', 'nsfw', 'mature', 'explicit']
  };

  // Check age restriction
  if (config.ageRestriction && config.ageRestriction < rules.ageRestriction) {
    return { isValid: false, reason: 'Age restriction must be 18+ for NSFW content' };
  }

  // Check for required content warnings
  if (!config.contentWarnings || !config.contentWarnings.some(warning => 
    rules.requiredWarnings.includes(warning))) {
    return { isValid: false, reason: 'NSFW content requires appropriate content warnings (adult-content, explicit-material, nudity)' };
  }

  // Check for prohibited content
  if (config.contentWarnings && config.contentWarnings.some(warning => 
    rules.prohibitedContent.includes(warning))) {
    return { isValid: false, reason: 'Prohibited content detected - no illegal activities, harmful content, or minors' };
  }

  // Validate NSFW level
  if (config.nsfwLevel === 'explicit' && config.privacy !== 'private') {
    return { isValid: false, reason: 'Explicit content must be private streams only' };
  }

  // Check category appropriateness
  if (config.isNSFW && !rules.allowedCategories.some(cat => 
    config.category.toLowerCase().includes(cat))) {
    return { isValid: false, reason: 'NSFW content must be in appropriate categories (adult, nsfw, mature, explicit)' };
  }

  return { isValid: true };
}

module.exports = router; 