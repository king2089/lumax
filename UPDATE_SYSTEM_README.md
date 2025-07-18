# 🚀 Luma Gen 1 Auto-Update System

A comprehensive auto-update system for the Luma Gen 1 mobile app with real backend integration, Strip Club 18+ support, and automatic app restart capabilities.

## ✨ Features

### 🔄 **Auto-Update System**
- **Background Updates**: Automatically checks for updates when app opens
- **Real Backend Integration**: Connects to actual update server
- **Progress Tracking**: Real-time download and installation progress
- **Smart Notifications**: Context-aware update notifications
- **App Restart**: Automatic app closure and restart after updates

### 🔥 **Strip Club 18+ Integration**
- **Specialized Updates**: Dedicated update channel for adult content
- **Age Verification**: Ensures 18+ requirements are met
- **Content Filtering**: Enhanced adult content management
- **Privacy Controls**: Advanced privacy features for sensitive content

### 📱 **User Experience**
- **Floating Notifications**: Non-intrusive update alerts
- **Progress Indicators**: Real-time progress bars and status messages
- **Auto-Update Toggle**: User control over automatic updates
- **Update History**: Track installed versions and preferences

## 🏗️ Architecture

### Frontend Components
```
src/
├── services/
│   ├── AutoUpdateService.ts          # Main update service
│   └── UpdateBackendService.ts       # Backend communication
├── components/
│   └── UpdateNotification.tsx        # Floating notifications
├── config/
│   └── updateServer.ts               # Server configuration
├── utils/
│   └── VersionManager.ts             # Version management
└── screens/
    ├── MenuScreen.tsx                # Update menu integration
    └── MarketplaceScreen.tsx         # Strip Club updates
```

### Backend Server
```
backend/
├── update-server.js                  # Express.js update server
├── package.json                      # Dependencies
└── README.md                         # Server documentation
```

## 🚀 Quick Start

### 1. Frontend Setup

The auto-update system is already integrated into the app. Key components:

- **AutoUpdateService**: Manages update checking and installation
- **UpdateNotification**: Shows floating update notifications
- **MenuScreen**: Software Update menu item with progress tracking
- **MarketplaceScreen**: Strip Club 18+ specific update checks

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start the update server
npm start

# For development with auto-restart
npm run dev
```

The server will run on `http://localhost:3001` and provide:
- Update checking endpoints
- Strip Club specific updates
- Update status reporting
- Download simulation

### 3. Environment Configuration

Create a `.env` file in your project root:

```env
# Update Server Configuration
EXPO_PUBLIC_UPDATE_SERVER_URL=http://localhost:3001/v1
EXPO_PUBLIC_UPDATE_API_KEY=your-api-key-here

# Development vs Production
NODE_ENV=development
```

## 🔧 Configuration

### Update Server Configuration

The system uses a centralized configuration in `src/config/updateServer.ts`:

```typescript
export const UPDATE_SERVER_CONFIG = {
  baseUrl: process.env.EXPO_PUBLIC_UPDATE_SERVER_URL,
  apiKey: process.env.EXPO_PUBLIC_UPDATE_API_KEY,
  appId: 'luma-gen1',
  channels: {
    development: 'dev',
    production: 'prod',
  },
  // ... more configuration
};
```

### Strip Club 18+ Configuration

Special configuration for adult content updates:

```typescript
export const STRIP_CLUB_UPDATE_CONFIG = {
  featureId: 'strip-club-18plus',
  requirements: {
    minAge: 18,
    ageVerification: true,
    contentPreferences: true,
  },
  // ... more configuration
};
```

## 📡 API Endpoints

### Update Server Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/updates/check` | POST | Check for general updates |
| `/v1/updates/strip-club` | POST | Check for Strip Club updates |
| `/v1/updates/report` | POST | Report update status |
| `/v1/updates/history` | GET | Get update history |
| `/v1/health` | GET | Server health check |

### Example API Request

```javascript
// Check for updates
const response = await fetch('http://localhost:3001/v1/updates/check', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-api-key',
    'X-Device-ID': 'device-id',
    'X-App-Version': '1.0.0',
    'X-Platform': 'ios',
  },
  body: JSON.stringify({
    currentVersion: '1.0.0',
    platform: 'ios',
    deviceId: 'device-id',
    appId: 'luma-gen1',
    channel: 'development',
  }),
});
```

## 🔄 Update Process Flow

### 1. **Background Check**
```typescript
// App opens → AutoUpdateService checks for updates
const autoUpdateService = AutoUpdateService.getInstance();
await autoUpdateService.checkForUpdatesInBackground();
```

### 2. **Update Notification**
```typescript
// If update found → Show floating notification
<UpdateNotification onUpdatePress={handleUpdatePress} />
```

### 3. **Download Process**
```typescript
// User initiates update → Download with progress tracking
const fileUri = await backendService.downloadUpdate(updateInfo, onProgress);
```

### 4. **Installation**
```typescript
// Download complete → Install update
const result = await backendService.installUpdate(updateInfo, fileUri);
```

### 5. **App Restart**
```typescript
// Installation complete → Restart app if required
if (result.requiresRestart) {
  await backendService.restartApp();
}
```

## 🔥 Strip Club 18+ Integration

### Special Update Checks

The Strip Club section automatically checks for updates:

```typescript
// In MarketplaceScreen.tsx
useEffect(() => {
  const checkForUpdates = async () => {
    const autoUpdateService = AutoUpdateService.getInstance();
    await autoUpdateService.checkStripClubUpdates();
  };
  
  const timer = setTimeout(checkForUpdates, 2000);
  return () => clearTimeout(timer);
}, []);
```

### Age Verification

Updates include age verification requirements:

```typescript
const stripClubUpdate = {
  requirements: {
    minAge: 18,
    ageVerification: true,
    contentPreferences: true,
  },
  features: [
    'Enhanced adult content filtering',
    'Improved age verification',
    'New nightlife features',
    'Advanced privacy controls',
  ],
};
```

## 🛠️ Development

### Testing the Update System

1. **Start the backend server**:
   ```bash
   cd backend
   npm start
   ```

2. **Run the mobile app**:
   ```bash
   npx expo start
   ```

3. **Trigger update checks**:
   - Open the app (background check)
   - Navigate to Menu → Software Update
   - Visit Strip Club 18+ section
   - Use "Check for Updates" button

### Simulating Updates

The backend server includes simulated updates:

- **Version 1.1.0**: General Gen 1 improvements
- **Version 1.2.0**: Advanced features (future)
- **Strip Club Updates**: Specialized adult content features

### Debugging

Enable debug logging:

```typescript
// In updateServer.ts
console.log('Update check request:', req.body);
console.log('Update available:', latestUpdate);
```

## 🔒 Security Features

### Update Verification
- **Checksum Validation**: Verifies download integrity
- **Version Comparison**: Ensures proper update sequence
- **Device Tracking**: Monitors update status per device

### Privacy Protection
- **Age Verification**: Required for adult content updates
- **Content Filtering**: Enhanced filtering for sensitive content
- **Privacy Controls**: User-controlled update preferences

## 📊 Monitoring

### Update Analytics

The system tracks:
- Update check frequency
- Download success rates
- Installation completion rates
- User update preferences
- Strip Club specific metrics

### Health Monitoring

```bash
# Check server health
curl http://localhost:3001/v1/health

# Response:
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "updates": ["1.1.0", "1.2.0"]
}
```

## 🚀 Production Deployment

### Backend Deployment

1. **Deploy to cloud platform** (Heroku, AWS, etc.)
2. **Set environment variables**:
   ```env
   PORT=3001
   NODE_ENV=production
   ```
3. **Update frontend configuration** with production URLs

### Frontend Configuration

Update `src/config/updateServer.ts`:

```typescript
export const getUpdateConfig = () => ({
  baseUrl: 'https://your-production-server.com/v1',
  channel: 'production',
  debug: false,
});
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/update-improvement`
3. **Make changes** and test thoroughly
4. **Submit pull request** with detailed description

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions:
- **GitHub Issues**: Create an issue in the repository
- **Documentation**: Check this README and inline code comments
- **Development**: Use the debug logging for troubleshooting

---

**🚀 Ready to deploy the next generation of Luma updates!** 