-- 🚀 Real Live Streaming Setup for Luma Gen 1
-- Run this in your Supabase SQL Editor to enable full live streaming

-- ========================================
-- 1. DROP EXISTING TABLES (if they exist)
-- ========================================
DROP TABLE IF EXISTS live_stream_reactions CASCADE;
DROP TABLE IF EXISTS live_stream_chat CASCADE;
DROP TABLE IF EXISTS live_stream_viewers CASCADE;
DROP TABLE IF EXISTS live_stream_events CASCADE;
DROP TABLE IF EXISTS live_streams CASCADE;

-- ========================================
-- 2. LIVE STREAMS TABLE
-- ========================================
CREATE TABLE live_streams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    quality VARCHAR(10) NOT NULL CHECK (quality IN ('1080p', '4K', '8K', '20K')),
    bitrate INTEGER NOT NULL,
    is_live BOOLEAN DEFAULT FALSE,
    viewers INTEGER DEFAULT 0,
    peak_viewers INTEGER DEFAULT 0,
    duration INTEGER DEFAULT 0,
    stream_key VARCHAR(255) UNIQUE NOT NULL,
    playback_url TEXT,
    thumbnail_url TEXT,
    privacy VARCHAR(20) DEFAULT 'public' CHECK (privacy IN ('public', 'friends', 'private')),
    category VARCHAR(50) DEFAULT 'general',
    tags TEXT[] DEFAULT '{}',
    is_nsfw BOOLEAN DEFAULT FALSE,
    nsfw_level VARCHAR(20) CHECK (nsfw_level IN ('mild', 'moderate', 'explicit')),
    age_restriction INTEGER DEFAULT 13,
    content_warnings TEXT[] DEFAULT '{}',
    ai_features JSONB DEFAULT '{
        "enabled": false,
        "realTimeEnhancement": false,
        "autoModeration": false,
        "viewerAnalytics": false
    }',
    analytics JSONB DEFAULT '{
        "totalViews": 0,
        "uniqueViewers": 0,
        "averageWatchTime": 0,
        "engagementRate": 0,
        "chatMessages": 0,
        "reactions": 0
    }',
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 3. LIVE STREAM EVENTS TABLE
-- ========================================
CREATE TABLE live_stream_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stream_id UUID NOT NULL REFERENCES live_streams(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('started', 'ended', 'viewer_joined', 'viewer_left', 'chat_message', 'reaction', 'error')),
    event_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 4. LIVE STREAM VIEWERS TABLE
-- ========================================
CREATE TABLE live_stream_viewers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stream_id UUID NOT NULL REFERENCES live_streams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    watch_duration INTEGER DEFAULT 0,
    UNIQUE(stream_id, user_id)
);

-- ========================================
-- 5. LIVE STREAM CHAT TABLE
-- ========================================
CREATE TABLE live_stream_chat (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stream_id UUID NOT NULL REFERENCES live_streams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_moderated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 6. LIVE STREAM REACTIONS TABLE
-- ========================================
CREATE TABLE live_stream_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stream_id UUID NOT NULL REFERENCES live_streams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reaction_type VARCHAR(20) NOT NULL CHECK (reaction_type IN ('like', 'love', 'laugh', 'wow', 'sad', 'angry')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(stream_id, user_id, reaction_type)
);

-- ========================================
-- 7. INDEXES FOR PERFORMANCE
-- ========================================
CREATE INDEX idx_live_streams_user_id ON live_streams(user_id);
CREATE INDEX idx_live_streams_is_live ON live_streams(is_live);
CREATE INDEX idx_live_streams_privacy ON live_streams(privacy);
CREATE INDEX idx_live_streams_category ON live_streams(category);
CREATE INDEX idx_live_streams_created_at ON live_streams(created_at);
CREATE INDEX idx_live_stream_events_stream_id ON live_stream_events(stream_id);
CREATE INDEX idx_live_stream_events_type ON live_stream_events(event_type);
CREATE INDEX idx_live_stream_viewers_stream_id ON live_stream_viewers(stream_id);
CREATE INDEX idx_live_stream_chat_stream_id ON live_stream_chat(stream_id);
CREATE INDEX idx_live_stream_reactions_stream_id ON live_stream_reactions(stream_id);

-- ========================================
-- 8. ENABLE ROW LEVEL SECURITY
-- ========================================
ALTER TABLE live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_stream_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_stream_viewers ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_stream_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_stream_reactions ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 9. SECURITY POLICIES
-- ========================================

-- Live Streams Policies
CREATE POLICY "Users can view public live streams" ON live_streams
    FOR SELECT USING (privacy = 'public' OR auth.uid() = user_id);

CREATE POLICY "Users can create their own live streams" ON live_streams
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own live streams" ON live_streams
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own live streams" ON live_streams
    FOR DELETE USING (auth.uid() = user_id);

-- Live Stream Events Policies
CREATE POLICY "Users can view events for public streams" ON live_stream_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM live_streams 
            WHERE live_streams.id = live_stream_events.stream_id 
            AND (live_streams.privacy = 'public' OR live_streams.user_id = auth.uid())
        )
    );

CREATE POLICY "Stream owners can create events" ON live_stream_events
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM live_streams 
            WHERE live_streams.id = live_stream_events.stream_id 
            AND live_streams.user_id = auth.uid()
        )
    );

-- Live Stream Viewers Policies
CREATE POLICY "Users can view viewers for public streams" ON live_stream_viewers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM live_streams 
            WHERE live_streams.id = live_stream_viewers.stream_id 
            AND (live_streams.privacy = 'public' OR live_streams.user_id = auth.uid())
        )
    );

CREATE POLICY "Users can join public streams" ON live_stream_viewers
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM live_streams 
            WHERE live_streams.id = live_stream_viewers.stream_id 
            AND (live_streams.privacy = 'public' OR live_streams.user_id = auth.uid())
        )
    );

-- Live Stream Chat Policies
CREATE POLICY "Users can view chat for public streams" ON live_stream_chat
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM live_streams 
            WHERE live_streams.id = live_stream_chat.stream_id 
            AND (live_streams.privacy = 'public' OR live_streams.user_id = auth.uid())
        )
    );

CREATE POLICY "Users can send chat messages to public streams" ON live_stream_chat
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM live_streams 
            WHERE live_streams.id = live_stream_chat.stream_id 
            AND (live_streams.privacy = 'public' OR live_streams.user_id = auth.uid())
        )
    );

-- Live Stream Reactions Policies
CREATE POLICY "Users can view reactions for public streams" ON live_stream_reactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM live_streams 
            WHERE live_streams.id = live_stream_reactions.stream_id 
            AND (live_streams.privacy = 'public' OR live_streams.user_id = auth.uid())
        )
    );

CREATE POLICY "Users can react to public streams" ON live_stream_reactions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM live_streams 
            WHERE live_streams.id = live_stream_reactions.stream_id 
            AND (live_streams.privacy = 'public' OR live_streams.user_id = auth.uid())
        )
    );

-- ========================================
-- 10. SAMPLE DATA FOR TESTING
-- ========================================

-- Insert sample live streams
INSERT INTO live_streams (
    user_id,
    title,
    description,
    quality,
    bitrate,
    is_live,
    viewers,
    peak_viewers,
    stream_key,
    category,
    tags,
    is_nsfw,
    nsfw_level,
    age_restriction,
    content_warnings,
    ai_features,
    analytics
) VALUES 
(
    '00000000-0000-0000-0000-000000000001',
    'Welcome to Luma Gen 1 Live! 🚀',
    'Experience the future of social media with AI-powered live streaming. Join us for the ultimate Gen 1 experience!',
    '4K',
    25000,
    true,
    1250,
    1500,
    'luma_gen1_welcome_stream_001',
    'general',
    ARRAY['welcome', 'gen1', 'ai', 'live', 'social'],
    false,
    'mild',
    13,
    ARRAY[],
    '{"enabled": true, "realTimeEnhancement": true, "autoModeration": true, "viewerAnalytics": true}',
    '{"totalViews": 5000, "uniqueViewers": 2500, "averageWatchTime": 1800, "engagementRate": 0.85, "chatMessages": 1250, "reactions": 850}'
),
(
    '00000000-0000-0000-0000-000000000002',
    'Gaming with Gen 1 AI 🎮',
    'Watch me play while AI enhances the experience. Real-time AI commentary and analysis!',
    '1080p',
    8000,
    true,
    850,
    900,
    'luma_gen1_gaming_stream_002',
    'gaming',
    ARRAY['gaming', 'ai', 'gen1', 'esports', 'live'],
    false,
    'mild',
    13,
    ARRAY[],
    '{"enabled": true, "realTimeEnhancement": false, "autoModeration": true, "viewerAnalytics": true}',
    '{"totalViews": 3000, "uniqueViewers": 1500, "averageWatchTime": 1200, "engagementRate": 0.75, "chatMessages": 850, "reactions": 600}'
),
(
    '00000000-0000-0000-0000-000000000003',
    'Music & AI Jam Session 🎵',
    'Live music creation with AI assistance. Watch as we compose in real-time!',
    '4K',
    25000,
    true,
    650,
    750,
    'luma_gen1_music_stream_003',
    'music',
    ARRAY['music', 'ai', 'gen1', 'live', 'creation'],
    false,
    'mild',
    13,
    ARRAY[],
    '{"enabled": true, "realTimeEnhancement": true, "autoModeration": false, "viewerAnalytics": true}',
    '{"totalViews": 2000, "uniqueViewers": 1200, "averageWatchTime": 2400, "engagementRate": 0.90, "chatMessages": 450, "reactions": 300}'
),
(
    '00000000-0000-0000-0000-000000000004',
    'Adult Content - 18+ Only 🔞',
    'Mature content with proper age verification and content warnings.',
    '1080p',
    8000,
    true,
    420,
    500,
    'luma_gen1_adult_stream_004',
    'adult',
    ARRAY['adult', 'mature', '18+', 'nsfw'],
    true,
    'moderate',
    18,
    ARRAY['adult-content', 'explicit-material', 'nudity'],
    '{"enabled": true, "realTimeEnhancement": false, "autoModeration": true, "viewerAnalytics": true}',
    '{"totalViews": 1500, "uniqueViewers": 800, "averageWatchTime": 900, "engagementRate": 0.65, "chatMessages": 200, "reactions": 150}'
);

-- Insert sample chat messages
INSERT INTO live_stream_chat (stream_id, user_id, message) VALUES
(
    (SELECT id FROM live_streams WHERE stream_key = 'luma_gen1_welcome_stream_001' LIMIT 1),
    '00000000-0000-0000-0000-000000000005',
    'Welcome to Luma Gen 1! This is amazing! 🚀'
),
(
    (SELECT id FROM live_streams WHERE stream_key = 'luma_gen1_welcome_stream_001' LIMIT 1),
    '00000000-0000-0000-0000-000000000006',
    'The AI features are incredible!'
),
(
    (SELECT id FROM live_streams WHERE stream_key = 'luma_gen1_gaming_stream_002' LIMIT 1),
    '00000000-0000-0000-0000-000000000007',
    'Great gameplay! The AI commentary is spot on! 🎮'
);

-- Insert sample reactions
INSERT INTO live_stream_reactions (stream_id, user_id, reaction_type) VALUES
(
    (SELECT id FROM live_streams WHERE stream_key = 'luma_gen1_welcome_stream_001' LIMIT 1),
    '00000000-0000-0000-0000-000000000005',
    'love'
),
(
    (SELECT id FROM live_streams WHERE stream_key = 'luma_gen1_welcome_stream_001' LIMIT 1),
    '00000000-0000-0000-0000-000000000006',
    'like'
),
(
    (SELECT id FROM live_streams WHERE stream_key = 'luma_gen1_gaming_stream_002' LIMIT 1),
    '00000000-0000-0000-0000-000000000007',
    'wow'
);

-- ========================================
-- 11. FUNCTIONS FOR AUTOMATION
-- ========================================

-- Function to update viewer count
CREATE OR REPLACE FUNCTION update_viewer_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE live_streams 
        SET viewers = viewers + 1,
            peak_viewers = GREATEST(peak_viewers, viewers + 1)
        WHERE id = NEW.stream_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' AND NEW.left_at IS NOT NULL AND OLD.left_at IS NULL THEN
        UPDATE live_streams 
        SET viewers = GREATEST(0, viewers - 1)
        WHERE id = NEW.stream_id;
        RETURN NEW;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for viewer count updates
CREATE TRIGGER trigger_update_viewer_count
    AFTER INSERT OR UPDATE ON live_stream_viewers
    FOR EACH ROW
    EXECUTE FUNCTION update_viewer_count();

-- Function to update stream duration
CREATE OR REPLACE FUNCTION update_stream_duration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.ended_at IS NOT NULL AND OLD.ended_at IS NULL THEN
        UPDATE live_streams 
        SET duration = EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at))
        WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for stream duration updates
CREATE TRIGGER trigger_update_stream_duration
    AFTER UPDATE ON live_streams
    FOR EACH ROW
    EXECUTE FUNCTION update_stream_duration();

-- ========================================
-- 12. SUCCESS MESSAGE
-- ========================================
SELECT '🎉 Live Streaming Database Setup Complete!' as status;
SELECT '✅ Tables created: live_streams, live_stream_events, live_stream_viewers, live_stream_chat, live_stream_reactions' as tables;
SELECT '✅ Sample data inserted: 4 live streams with chat and reactions' as data;
SELECT '✅ Security policies enabled: Row Level Security with proper access controls' as security;
SELECT '✅ Performance optimized: Indexes created for fast queries' as performance;
SELECT '🚀 Your Luma Gen 1 live streaming is now ready!' as ready; 