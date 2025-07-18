-- Live Streaming Database Schema for Luma Gen 1

-- Live Streams Table
CREATE TABLE IF NOT EXISTS live_streams (
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

-- Live Stream Events Table
CREATE TABLE IF NOT EXISTS live_stream_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stream_id UUID NOT NULL REFERENCES live_streams(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('started', 'ended', 'viewer_joined', 'viewer_left', 'chat_message', 'reaction', 'error')),
    event_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Live Stream Chat Messages Table
CREATE TABLE IF NOT EXISTS live_stream_chat (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stream_id UUID NOT NULL REFERENCES live_streams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Live Stream Reactions Table
CREATE TABLE IF NOT EXISTS live_stream_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stream_id UUID NOT NULL REFERENCES live_streams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reaction VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(stream_id, user_id, reaction)
);

-- Live Stream Viewers Table (for tracking unique viewers)
CREATE TABLE IF NOT EXISTS live_stream_viewers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stream_id UUID NOT NULL REFERENCES live_streams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    watch_duration INTEGER DEFAULT 0,
    UNIQUE(stream_id, user_id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_live_streams_user_id ON live_streams(user_id);
CREATE INDEX IF NOT EXISTS idx_live_streams_is_live ON live_streams(is_live);
CREATE INDEX IF NOT EXISTS idx_live_streams_category ON live_streams(category);
CREATE INDEX IF NOT EXISTS idx_live_streams_created_at ON live_streams(created_at);
CREATE INDEX IF NOT EXISTS idx_live_streams_viewers ON live_streams(viewers);

CREATE INDEX IF NOT EXISTS idx_live_stream_events_stream_id ON live_stream_events(stream_id);
CREATE INDEX IF NOT EXISTS idx_live_stream_events_type ON live_stream_events(event_type);
CREATE INDEX IF NOT EXISTS idx_live_stream_events_created_at ON live_stream_events(created_at);

CREATE INDEX IF NOT EXISTS idx_live_stream_chat_stream_id ON live_stream_chat(stream_id);
CREATE INDEX IF NOT EXISTS idx_live_stream_chat_user_id ON live_stream_chat(user_id);
CREATE INDEX IF NOT EXISTS idx_live_stream_chat_created_at ON live_stream_chat(created_at);

CREATE INDEX IF NOT EXISTS idx_live_stream_reactions_stream_id ON live_stream_reactions(stream_id);
CREATE INDEX IF NOT EXISTS idx_live_stream_reactions_user_id ON live_stream_reactions(user_id);

CREATE INDEX IF NOT EXISTS idx_live_stream_viewers_stream_id ON live_stream_viewers(stream_id);
CREATE INDEX IF NOT EXISTS idx_live_stream_viewers_user_id ON live_stream_viewers(user_id);

-- Row Level Security (RLS) Policies
ALTER TABLE live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_stream_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_stream_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_stream_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_stream_viewers ENABLE ROW LEVEL SECURITY;

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
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM live_streams 
            WHERE live_streams.id = live_stream_chat.stream_id 
            AND live_streams.privacy = 'public'
        )
    );

CREATE POLICY "Users can delete their own chat messages" ON live_stream_chat
    FOR UPDATE USING (auth.uid() = user_id);

-- Live Stream Reactions Policies
CREATE POLICY "Users can view reactions for public streams" ON live_stream_reactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM live_streams 
            WHERE live_streams.id = live_stream_reactions.stream_id 
            AND (live_streams.privacy = 'public' OR live_streams.user_id = auth.uid())
        )
    );

CREATE POLICY "Users can send reactions to public streams" ON live_stream_reactions
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM live_streams 
            WHERE live_streams.id = live_stream_reactions.stream_id 
            AND live_streams.privacy = 'public'
        )
    );

-- Live Stream Viewers Policies
CREATE POLICY "Users can view viewer data for public streams" ON live_stream_viewers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM live_streams 
            WHERE live_streams.id = live_stream_viewers.stream_id 
            AND (live_streams.privacy = 'public' OR live_streams.user_id = auth.uid())
        )
    );

CREATE POLICY "Users can track their own viewing" ON live_stream_viewers
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM live_streams 
            WHERE live_streams.id = live_stream_viewers.stream_id 
            AND live_streams.privacy = 'public'
        )
    );

CREATE POLICY "Users can update their own viewing data" ON live_stream_viewers
    FOR UPDATE USING (auth.uid() = user_id);

-- Functions for analytics and management
CREATE OR REPLACE FUNCTION increment_stream_viewers(stream_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE live_streams 
    SET viewers = viewers + 1,
        peak_viewers = GREATEST(peak_viewers, viewers + 1),
        updated_at = NOW()
    WHERE id = stream_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_stream_viewers(stream_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE live_streams 
    SET viewers = GREATEST(0, viewers - 1),
        updated_at = NOW()
    WHERE id = stream_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_chat_messages(stream_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE live_streams 
    SET analytics = jsonb_set(
        analytics, 
        '{chatMessages}', 
        to_jsonb((analytics->>'chatMessages')::int + 1)
    ),
    updated_at = NOW()
    WHERE id = stream_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_reactions(stream_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE live_streams 
    SET analytics = jsonb_set(
        analytics, 
        '{reactions}', 
        to_jsonb((analytics->>'reactions')::int + 1)
    ),
    updated_at = NOW()
    WHERE id = stream_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate stream analytics
CREATE OR REPLACE FUNCTION calculate_stream_analytics(stream_id UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'totalViews', COALESCE(ls.peak_viewers, 0),
        'uniqueViewers', COALESCE(COUNT(DISTINCT lsv.user_id), 0),
        'averageWatchTime', COALESCE(AVG(lsv.watch_duration), 0),
        'engagementRate', CASE 
            WHEN ls.peak_viewers > 0 THEN 
                ROUND(((COALESCE(COUNT(lsc.id), 0) + COALESCE(COUNT(lsr.id), 0))::float / ls.peak_viewers) * 100, 2)
            ELSE 0 
        END,
        'chatMessages', COALESCE(COUNT(lsc.id), 0),
        'reactions', COALESCE(COUNT(lsr.id), 0)
    ) INTO result
    FROM live_streams ls
    LEFT JOIN live_stream_viewers lsv ON ls.id = lsv.stream_id
    LEFT JOIN live_stream_chat lsc ON ls.id = lsc.stream_id AND lsc.is_deleted = false
    LEFT JOIN live_stream_reactions lsr ON ls.id = lsr.stream_id
    WHERE ls.id = stream_id
    GROUP BY ls.id, ls.peak_viewers;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update analytics when stream ends
CREATE OR REPLACE FUNCTION update_stream_analytics_on_end()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.is_live = true AND NEW.is_live = false THEN
        NEW.analytics = calculate_stream_analytics(NEW.id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_stream_analytics
    BEFORE UPDATE ON live_streams
    FOR EACH ROW
    EXECUTE FUNCTION update_stream_analytics_on_end();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_live_streams_updated_at
    BEFORE UPDATE ON live_streams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing
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
    ai_features
) VALUES 
(
    '00000000-0000-0000-0000-000000000001',
    'Welcome to Luma Gen 1 Live!',
    'Experience the future of social media with AI-powered live streaming',
    '4K',
    25000,
    true,
    1250,
    1500,
    'luma_gen1_welcome_stream',
    'general',
    ARRAY['welcome', 'gen1', 'ai'],
    '{"enabled": true, "realTimeEnhancement": true, "autoModeration": true, "viewerAnalytics": true}'
),
(
    '00000000-0000-0000-0000-000000000002',
    'Gaming with Gen 1 AI',
    'Watch me play while AI enhances the experience',
    '1080p',
    8000,
    true,
    850,
    900,
    'luma_gen1_gaming_stream',
    'gaming',
    ARRAY['gaming', 'ai', 'gen1'],
    '{"enabled": true, "realTimeEnhancement": false, "autoModeration": true, "viewerAnalytics": true}'
),
(
    '00000000-0000-0000-0000-000000000003',
    'Music & AI Collaboration',
    'Live music performance enhanced by Gen 1 AI',
    '8K',
    50000,
    false,
    0,
    2100,
    'luma_gen1_music_stream',
    'music',
    ARRAY['music', 'ai', 'collaboration'],
    '{"enabled": true, "realTimeEnhancement": true, "autoModeration": false, "viewerAnalytics": true}'
)
ON CONFLICT (stream_key) DO NOTHING; 