# Luma Gen 1 Live Streaming Feature

## Overview

The Luma Gen 1 Live Streaming feature provides a comprehensive, AI-powered live streaming solution integrated with the Luma social platform. This feature enables users to broadcast live content with advanced quality options, real-time AI enhancements, and seamless social integration.

## Features

### 🎥 **Multi-Quality Streaming**
- **1080p HD**: Standard high definition (8,000 kbps)
- **4K Ultra HD**: Ultra high definition (25,000 kbps)
- **8K Cinema**: Cinema-grade quality (50,000 kbps)
- **20K Next-Gen**: Future-proof streaming (100,000 kbps)

### 🤖 **AI-Powered Enhancements**
- **Real-time AI Enhancement**: Automatic video quality improvement
- **Auto Moderation**: AI-powered content filtering
- **Viewer Analytics**: Real-time engagement tracking
- **Smart Recommendations**: AI-driven content suggestions

### 🔒 **Privacy Controls**
- **Public**: Open to all users
- **Friends**: Limited to friends only
- **Private**: Invitation-only streams

### 📊 **Advanced Analytics**
- Real-time viewer count
- Peak viewer tracking
- Engagement rate calculation
- Chat message analytics
- Reaction tracking
- Watch time statistics

### 💬 **Interactive Features**
- Real-time chat system
- Live reactions (emojis, custom reactions)
- Viewer join/leave notifications
- Stream events tracking

## Architecture

### Frontend Components

#### 1. **LiveStreamingService** (`src/services/LiveStreamingService.ts`)
- Singleton service for managing live streaming operations
- Real-time event handling with Supabase subscriptions
- Stream lifecycle management (create, start, end)
- Viewer and analytics tracking

#### 2. **useLiveStreaming Hook** (`src/hooks/useLiveStreaming.ts`)
- React hook providing easy access to live streaming functionality
- State management for streams, events, and UI
- Error handling and user feedback
- Integration with mood detection and analytics

#### 3. **HomeScreen Integration** (`src/screens/HomeScreen.tsx`)
- Live streaming UI components
- Camera preview and controls
- Stream configuration modal
- Real-time status indicators

### Backend Components

#### 1. **API Routes** (`backend/routes/liveStreaming.js`)
- RESTful API endpoints for live streaming operations
- Authentication and authorization
- Real-time event handling
- Analytics and reporting

#### 2. **Database Schema** (`backend/database/live_streaming_schema.sql`)
- Comprehensive database design with PostgreSQL
- Row Level Security (RLS) policies
- Optimized indexes for performance
- Automated analytics triggers

## Database Schema

### Core Tables

#### `live_streams`
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key to auth.users)
- title: VARCHAR(255)
- description: TEXT
- quality: VARCHAR(10) (1080p, 4K, 8K, 20K)
- bitrate: INTEGER
- is_live: BOOLEAN
- viewers: INTEGER
- peak_viewers: INTEGER
- duration: INTEGER
- stream_key: VARCHAR(255) UNIQUE
- privacy: VARCHAR(20) (public, friends, private)
- category: VARCHAR(50)
- tags: TEXT[]
- ai_features: JSONB
- analytics: JSONB
```

#### `live_stream_events`
```sql
- id: UUID (Primary Key)
- stream_id: UUID (Foreign Key)
- event_type: VARCHAR(50)
- event_data: JSONB
- created_at: TIMESTAMP
```

#### `live_stream_chat`
```sql
- id: UUID (Primary Key)
- stream_id: UUID (Foreign Key)
- user_id: UUID (Foreign Key)
- message: TEXT
- is_deleted: BOOLEAN
- created_at: TIMESTAMP
```

#### `live_stream_reactions`
```sql
- id: UUID (Primary Key)
- stream_id: UUID (Foreign Key)
- user_id: UUID (Foreign Key)
- reaction: VARCHAR(50)
- created_at: TIMESTAMP
```

#### `live_stream_viewers`
```sql
- id: UUID (Primary Key)
- stream_id: UUID (Foreign Key)
- user_id: UUID (Foreign Key)
- joined_at: TIMESTAMP
- left_at: TIMESTAMP
- watch_duration: INTEGER
```

## API Endpoints

### Stream Management
- `POST /api/live-streaming/create` - Create new stream
- `POST /api/live-streaming/start/:streamId` - Start stream
- `POST /api/live-streaming/end/:streamId` - End stream
- `GET /api/live-streaming/live` - Get live streams
- `GET /api/live-streaming/:streamId` - Get specific stream

### Viewer Interaction
- `POST /api/live-streaming/:streamId/join` - Join stream
- `POST /api/live-streaming/:streamId/leave` - Leave stream
- `POST /api/live-streaming/:streamId/chat` - Send chat message
- `POST /api/live-streaming/:streamId/reaction` - Send reaction

### Analytics & Events
- `GET /api/live-streaming/:streamId/events` - Get stream events
- `GET /api/live-streaming/:streamId/analytics` - Get stream analytics
- `GET /api/live-streaming/user/:userId` - Get user's streams

## Usage Examples

### Creating a Live Stream

```typescript
import { useLiveStreaming } from '../hooks/useLiveStreaming';

const { createLiveStream, startLiveStream } = useLiveStreaming();

const handleGoLive = async () => {
  const streamConfig = {
    title: "My Gen 1 Stream",
    description: "AI-powered live content",
    quality: "4K" as const,
    bitrate: 25000,
    enableAI: true,
    enableHDR: false,
    enableRayTracing: false,
    privacy: "public" as const,
    category: "general",
    tags: ["gen1", "ai"],
    isNSFW: false
  };

  const stream = await createLiveStream(streamConfig);
  if (stream) {
    await startLiveStream(stream.id);
  }
};
```

### Joining a Live Stream

```typescript
const { joinLiveStream, sendChatMessage, sendReaction } = useLiveStreaming();

// Join stream
await joinLiveStream(streamId);

// Send chat message
await sendChatMessage(streamId, "Hello from Gen 1!");

// Send reaction
await sendReaction(streamId, "🔥");
```

### Real-time Event Handling

```typescript
const { streamEvents, clearEvents } = useLiveStreaming();

// Listen to real-time events
useEffect(() => {
  streamEvents.forEach(event => {
    switch (event.type) {
      case 'viewer_joined':
        console.log('New viewer joined:', event.data.userId);
        break;
      case 'chat_message':
        console.log('New chat message:', event.data.message);
        break;
      case 'reaction':
        console.log('New reaction:', event.data.reaction);
        break;
    }
  });
}, [streamEvents]);
```

## Security Features

### Row Level Security (RLS)
- Users can only view public streams or their own streams
- Stream owners have full control over their content
- Chat and reactions are restricted to public streams
- Viewer tracking respects privacy settings

### Authentication
- All API endpoints require valid authentication
- Stream creation and management require user authentication
- Real-time events are filtered based on user permissions

### Content Moderation
- AI-powered auto-moderation for chat messages
- NSFW content detection and filtering
- Report system for inappropriate content
- Stream termination for policy violations

## Performance Optimizations

### Database Indexes
- Optimized indexes for common queries
- Composite indexes for complex filtering
- Partial indexes for active streams

### Real-time Performance
- Efficient Supabase subscriptions
- Event batching for high-traffic streams
- Connection pooling for database operations

### Caching Strategy
- Stream metadata caching
- Analytics data caching
- User session caching

## Monitoring & Analytics

### Real-time Metrics
- Viewer count tracking
- Engagement rate calculation
- Stream quality monitoring
- Error rate tracking

### Analytics Dashboard
- Stream performance metrics
- User engagement analytics
- Quality distribution analysis
- Popular content insights

## Future Enhancements

### Planned Features
- **Multi-stream Support**: Host multiple simultaneous streams
- **Advanced AI Features**: Real-time content generation
- **Monetization**: Virtual gifts and subscriptions
- **Collaborative Streaming**: Multi-host streams
- **VR/AR Integration**: Immersive streaming experiences

### Technical Improvements
- **WebRTC Integration**: Peer-to-peer streaming
- **CDN Optimization**: Global content delivery
- **Machine Learning**: Predictive analytics
- **Edge Computing**: Reduced latency

## Troubleshooting

### Common Issues

#### Stream Won't Start
1. Check camera permissions
2. Verify network connectivity
3. Ensure stream configuration is valid
4. Check backend service status

#### Chat Not Working
1. Verify stream is public
2. Check user authentication
3. Ensure message length is within limits
4. Check for moderation blocks

#### Poor Stream Quality
1. Check network bandwidth
2. Reduce stream quality settings
3. Close other bandwidth-intensive apps
4. Verify device performance

### Debug Mode
Enable debug logging by setting environment variable:
```bash
DEBUG_LIVE_STREAMING=true
```

## Contributing

### Development Setup
1. Install dependencies: `npm install`
2. Set up database: Run `live_streaming_schema.sql`
3. Configure environment variables
4. Start development server: `npm run dev`

### Testing
- Unit tests: `npm test`
- Integration tests: `npm run test:integration`
- E2E tests: `npm run test:e2e`

### Code Style
- Follow TypeScript best practices
- Use ESLint and Prettier
- Write comprehensive documentation
- Include unit tests for new features

## License

This feature is part of the Luma Gen 1 platform and is proprietary software. All rights reserved.

---

**Luma Gen 1 Live Streaming** - Experience the future of social media with AI-powered live streaming technology. 