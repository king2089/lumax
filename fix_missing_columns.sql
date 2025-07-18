-- 🔧 Quick Fix for Missing Columns
-- Run this if you get "column does not exist" errors

-- Add missing columns to live_streams table
ALTER TABLE live_streams 
ADD COLUMN IF NOT EXISTS privacy VARCHAR(20) DEFAULT 'public' CHECK (privacy IN ('public', 'friends', 'private'));

ALTER TABLE live_streams 
ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'general';

ALTER TABLE live_streams 
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

ALTER TABLE live_streams 
ADD COLUMN IF NOT EXISTS is_nsfw BOOLEAN DEFAULT FALSE;

ALTER TABLE live_streams 
ADD COLUMN IF NOT EXISTS nsfw_level VARCHAR(20) CHECK (nsfw_level IN ('mild', 'moderate', 'explicit'));

ALTER TABLE live_streams 
ADD COLUMN IF NOT EXISTS age_restriction INTEGER DEFAULT 13;

ALTER TABLE live_streams 
ADD COLUMN IF NOT EXISTS content_warnings TEXT[] DEFAULT '{}';

ALTER TABLE live_streams 
ADD COLUMN IF NOT EXISTS ai_features JSONB DEFAULT '{
    "enabled": false,
    "realTimeEnhancement": false,
    "autoModeration": false,
    "viewerAnalytics": false
}';

ALTER TABLE live_streams 
ADD COLUMN IF NOT EXISTS analytics JSONB DEFAULT '{
    "totalViews": 0,
    "uniqueViewers": 0,
    "averageWatchTime": 0,
    "engagementRate": 0,
    "chatMessages": 0,
    "reactions": 0
}';

-- Success message
SELECT '✅ Missing columns added successfully!' as status;
SELECT '🔧 Run the full setup_real_live_streaming.sql for complete setup' as next_step; 