# 🗄️ Database Setup Guide for Luma Gen 1 Live Streaming

## 🚨 Current Issue
The app is showing an error because the `live_streams` database table doesn't exist. This guide will help you set it up.

## ✅ Quick Fix (Temporary)
The app now has fallback data, so it won't crash. You can test the live streaming features with demo data while setting up the database.

## 🔧 Database Setup Steps

### Step 1: Access Supabase
1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your Luma project

### Step 2: Open SQL Editor
1. In the left sidebar, click **"SQL Editor"**
2. Click **"New query"** to create a new SQL script

### Step 3: Run the Setup Script
Copy and paste this entire SQL code into the editor:

```sql
-- Live Streaming Setup for Luma Gen 1
-- Run this in your Supabase SQL Editor

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

-- Enable RLS
ALTER TABLE live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_stream_events ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies
CREATE POLICY "Users can view public live streams" ON live_streams
    FOR SELECT USING (privacy = 'public' OR auth.uid() = user_id);

CREATE POLICY "Users can create their own live streams" ON live_streams
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own live streams" ON live_streams
    FOR UPDATE USING (auth.uid() = user_id);

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

-- Insert sample data
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
)
ON CONFLICT (stream_key) DO NOTHING;
```

### Step 4: Execute the Script
1. Click the **"Run"** button (or press Ctrl+Enter)
2. Wait for the success message
3. You should see "Success. No rows returned" or similar

### Step 5: Verify Setup
1. Go to **"Table Editor"** in the left sidebar
2. You should see two new tables: `live_streams` and `live_stream_events`
3. Click on `live_streams` to see the sample data

## 🎉 What This Enables

After setup, you'll have:
- ✅ **Live streaming functionality** with Gen 1 AI features
- ✅ **NSFW content support** with age restrictions
- ✅ **Real-time analytics** and viewer tracking
- ✅ **Privacy controls** (public, friends, private)
- ✅ **Sample streams** to test with

## 🧪 Testing

1. **Restart your app** if it's running
2. **Try the "Go Live" button** - it should work now
3. **Check the live streams list** - you should see real data from the database
4. **Test NSFW features** - toggle NSFW content and set restrictions

## 🆘 If You Still Get Errors

If you still see database errors after setup:
1. **Check the console logs** for specific error messages
2. **Verify the tables exist** in Supabase Table Editor
3. **Make sure your app has the correct Supabase URL and API key**
4. **Try refreshing the app** completely

## 📞 Need Help?

The app now has fallback data, so it won't crash even without the database. You can:
- **Test features immediately** with demo data
- **Set up the database later** when convenient
- **Use the live streaming features** with mock data for now

---

**Note**: The fallback data ensures your app works immediately while you set up the database. Once the database is configured, the app will automatically switch to using real data. 