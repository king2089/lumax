const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Device-ID', 'X-App-Version', 'X-Platform', 'X-App-ID', 'X-Channel']
}));
app.use(express.json());

// Serve static files from web directory
app.use('/web', express.static(path.join(__dirname, 'web')));

// Serve favicon
app.get('/favicon.ico', (req, res) => {
  res.status(404).send('Not found');
});

// In-memory storage for updates (in production, use a database)
const updates = {
  '1.1.0': {
    version: '1.1.0',
    buildNumber: '101',
    releaseDate: new Date('2025-07-01').toISOString(),
    features: [
      'Enhanced Gen 1 AI features',
      'Improved live streaming quality',
      'New content creation tools',
      'Performance optimizations',
      'Bug fixes and stability improvements',
      'Strip Club 18+ enhancements',
      'Auto-update improvements'
    ],
    isRequired: false,
    downloadSize: 45.2 * 1024 * 1024, // 45.2 MB
    downloadUrl: 'https://luma-updates.com/downloads/luma-gen1-1.1.0.zip',
    changelog: [
      '🚀 New Gen 1 AI assistant with enhanced capabilities',
      '📺 Improved 4K/8K live streaming with HDR support',
      '🎨 Advanced content creation tools with AI assistance',
      '⚡ Performance improvements and faster loading times',
      '🐛 Fixed various bugs and improved stability',
      '🎯 Enhanced user experience with smoother animations',
      '🔥 Strip Club 18+ new features and improvements',
      '🔄 Auto-update system enhancements'
    ],
    minVersion: '1.0.0',
    maxVersion: '1.0.9',
    updateType: 'minor',
    checksum: 'sha256:abc123def456ghi789',
    isHotUpdate: false,
  },
  '1.2.0': {
    version: '1.2.0',
    buildNumber: '102',
    releaseDate: new Date('2025-10-01').toISOString(),
    features: [
      'Advanced AI-powered content recommendations',
      'Real-time collaboration features',
      'Enhanced security and privacy controls',
      'New social features and community tools',
      'Improved accessibility features',
      'Strip Club 18+ advanced features',
      'Gen 2 preview features'
    ],
    isRequired: false,
    downloadSize: 52.8 * 1024 * 1024, // 52.8 MB
    downloadUrl: 'https://luma-updates.com/downloads/luma-gen1-1.2.0.zip',
    changelog: [
      '🤖 AI-powered content recommendations',
      '👥 Real-time collaboration tools',
      '🔒 Enhanced security and privacy',
      '🌐 New social and community features',
      '♿ Improved accessibility support',
      '🔥 Strip Club 18+ advanced features',
      '🚀 Gen 2 preview features unlocked'
    ],
    minVersion: '1.1.0',
    maxVersion: '1.1.9',
    updateType: 'minor',
    checksum: 'sha256:def456ghi789jkl012',
    isHotUpdate: false,
  },
  '2.0.0': {
    version: '2.0.0',
    buildNumber: '200',
    releaseDate: new Date('2026-04-01').toISOString(),
    features: [
      '🎮 Luma Game Engine - Full 3D gaming platform',
      '🎯 Advanced AI with Gen 2 capabilities',
      '🌐 Metaverse integration and virtual worlds',
      '🎨 Real-time 3D content creation tools',
      '🎪 Interactive live events and concerts',
      '🤖 AI-powered game development',
      '🎲 Built-in game marketplace',
      '🎭 Advanced avatar customization',
      '🌍 Cross-platform gaming',
      '🎪 Virtual strip club and adult entertainment',
      '🎮 Multiplayer gaming experiences',
      '🎨 3D modeling and animation tools'
    ],
    isRequired: false,
    downloadSize: 150.5 * 1024 * 1024, // 150.5 MB
    downloadUrl: 'https://luma-updates.com/downloads/luma-gen2-2.0.0.zip',
    changelog: [
      '🎮 Luma Game Engine - Complete 3D gaming platform',
      '🎯 Gen 2 AI with advanced reasoning and creativity',
      '🌐 Metaverse integration with virtual worlds',
      '🎨 Real-time 3D content creation and editing',
      '🎪 Interactive live events with 3D avatars',
      '🤖 AI-powered game development tools',
      '🎲 Built-in game marketplace with monetization',
      '🎭 Advanced avatar customization with 3D models',
      '🌍 Cross-platform gaming across devices',
      '🎪 Virtual strip club with 3D adult content',
      '🎮 Multiplayer gaming with real-time physics',
      '🎨 Professional 3D modeling and animation suite',
      '🚀 Performance optimizations for next-gen hardware',
      '🔒 Enhanced security for virtual transactions',
      '🌐 Global CDN for faster content delivery'
    ],
    minVersion: '1.2.0',
    maxVersion: '1.9.9',
    updateType: 'major',
    checksum: 'sha256:gen2abc123def456',
    isHotUpdate: false,
  }
};

// In-memory storage for pre-registrations
let preRegistrations = [];
let stats = {
  totalRegistrations: 15420,
  earlyAccessCount: 0,
  betaAccessCount: 0,
  lastUpdated: new Date().toISOString()
};

// Update history storage
const updateHistory = new Map();

// Helper function to compare versions
function compareVersions(version1, version2) {
  const v1Parts = version1.split('.').map(Number);
  const v2Parts = version2.split('.').map(Number);

  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const v1 = v1Parts[i] || 0;
    const v2 = v2Parts[i] || 0;
    
    if (v1 > v2) return 1;
    if (v1 < v2) return -1;
  }
  
  return 0;
}

// Routes

// Check for updates
app.post('/v1/updates/check', (req, res) => {
  try {
    const { currentVersion, platform, deviceId, appId, channel } = req.body;
    
    console.log(`Update check request from ${deviceId} (${platform}) - current version: ${currentVersion}`);
    
    // Find the latest available update
    let latestUpdate = null;
    for (const [version, update] of Object.entries(updates)) {
      if (compareVersions(version, currentVersion) > 0) {
        if (!latestUpdate || compareVersions(version, latestUpdate.version) > 0) {
          latestUpdate = update;
        }
      }
    }
    
    if (latestUpdate) {
      console.log(`Update available: ${latestUpdate.version}`);
      res.json({
        hasUpdate: true,
        updateInfo: latestUpdate
      });
    } else {
      console.log('No updates available');
      res.json({
        hasUpdate: false,
        message: 'No updates available'
      });
    }
  } catch (error) {
    console.error('Error checking for updates:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Check for Strip Club specific updates
app.post('/v1/updates/strip-club', (req, res) => {
  try {
    const { currentVersion, platform, deviceId, feature } = req.body;
    
    console.log(`Strip Club update check from ${deviceId} - feature: ${feature}`);
    
    // Check if there's a Strip Club specific update
    const stripClubUpdate = updates['1.1.0']; // Use the latest update for Strip Club features
    
    if (stripClubUpdate && compareVersions(stripClubUpdate.version, currentVersion) > 0) {
      // Add Strip Club specific features
      const enhancedUpdate = {
        ...stripClubUpdate,
        features: [
          ...stripClubUpdate.features,
          'Enhanced adult content filtering',
          'Improved age verification',
          'New nightlife features',
          'Advanced privacy controls'
        ],
        changelog: [
          ...stripClubUpdate.changelog,
          '🔥 Strip Club 18+ enhanced features',
          '🔞 Improved adult content management',
          '🎭 New nightlife entertainment features'
        ]
      };
      
      console.log(`Strip Club update available: ${enhancedUpdate.version}`);
      res.json({
        hasUpdate: true,
        updateInfo: enhancedUpdate
      });
    } else {
      console.log('No Strip Club updates available');
      res.json({
        hasUpdate: false,
        message: 'No Strip Club updates available'
      });
    }
  } catch (error) {
    console.error('Error checking Strip Club updates:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Check for Gen 1 specific updates
app.post('/v1/updates/gen1', (req, res) => {
  try {
    const { currentVersion, platform, deviceId, feature } = req.body;
    
    console.log(`Gen 1 update check from ${deviceId} - feature: ${feature}`);
    
    // Check for Gen 1 updates (versions 1.x.x)
    let gen1Update = null;
    for (const [version, update] of Object.entries(updates)) {
      if (version.startsWith('1.') && compareVersions(version, currentVersion) > 0) {
        if (!gen1Update || compareVersions(version, gen1Update.version) > 0) {
          gen1Update = update;
        }
      }
    }
    
    if (gen1Update) {
      // Add Gen 1 specific features and branding
      const enhancedUpdate = {
        ...gen1Update,
        features: [
          ...gen1Update.features,
          'Enhanced Gen 1 AI assistant',
          'Improved content creation tools',
          'Better performance and stability',
          'New social features',
          'Enhanced privacy controls'
        ],
        changelog: [
          ...gen1Update.changelog,
          '🤖 Enhanced Gen 1 AI capabilities',
          '🎨 Improved content creation experience',
          '⚡ Better performance and faster loading',
          '🔒 Enhanced privacy and security',
          '🎯 New Gen 1 exclusive features'
        ],
        updateType: gen1Update.updateType === 'major' ? 'minor' : gen1Update.updateType,
        isGen1Update: true
      };
      
      console.log(`Gen 1 update available: ${enhancedUpdate.version}`);
      res.json({
        hasUpdate: true,
        updateInfo: enhancedUpdate
      });
    } else {
      console.log('No Gen 1 updates available');
      res.json({
        hasUpdate: false,
        message: 'No Gen 1 updates available'
      });
    }
  } catch (error) {
    console.error('Error checking Gen 1 updates:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Check for Gen 2 specific updates
app.post('/v1/updates/gen2', (req, res) => {
  try {
    const { currentVersion, platform, deviceId, feature } = req.body;
    
    console.log(`Gen 2 update check from ${deviceId} - feature: ${feature}`);
    
    // Check if there's a Gen 2 update available
    const gen2Update = updates['2.0.0'];
    
    if (gen2Update && compareVersions(gen2Update.version, currentVersion) > 0) {
      console.log(`Gen 2 update available: ${gen2Update.version}`);
      res.json({
        hasUpdate: true,
        updateInfo: gen2Update
      });
    } else {
      console.log('No Gen 2 updates available');
      res.json({
        hasUpdate: false,
        message: 'No Gen 2 updates available'
      });
    }
  } catch (error) {
    console.error('Error checking Gen 2 updates:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Report update status
app.post('/v1/updates/report', (req, res) => {
  try {
    const { updateId, status, error, deviceId, timestamp } = req.body;
    
    console.log(`Update status report from ${deviceId}: ${updateId} - ${status}`);
    
    // Store update history
    if (!updateHistory.has(deviceId)) {
      updateHistory.set(deviceId, []);
    }
    
    updateHistory.get(deviceId).push({
      updateId,
      status,
      error,
      timestamp,
      deviceId
    });
    
    res.json({
      success: true,
      message: 'Status reported successfully'
    });
  } catch (error) {
    console.error('Error reporting update status:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get update history
app.get('/v1/updates/history', (req, res) => {
  try {
    const { deviceId } = req.query;
    
    if (deviceId && updateHistory.has(deviceId)) {
      res.json({
        updates: updateHistory.get(deviceId)
      });
    } else {
      res.json({
        updates: []
      });
    }
  } catch (error) {
    console.error('Error fetching update history:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Simulate update download
app.get('/v1/updates/download/:version', (req, res) => {
  try {
    const { version } = req.params;
    const update = updates[version];
    
    if (!update) {
      return res.status(404).json({
        error: 'Update not found',
        message: `Update version ${version} not found`
      });
    }
    
    console.log(`Download request for version ${version}`);
    
    // Simulate download by sending update info
    res.json({
      downloadUrl: update.downloadUrl,
      size: update.downloadSize,
      checksum: update.checksum
    });
  } catch (error) {
    console.error('Error handling download request:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Main landing page for Luma Gen 2
app.get('/', (req, res) => {
  // Serve the web/index.html file
  const indexPath = path.join(__dirname, 'web', 'index.html');
  
  fs.readFile(indexPath, 'utf8')
    .then(html => {
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    })
    .catch(error => {
      console.error('Error reading index.html:', error);
      // Fallback to simple HTML if file not found
      const fallbackHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Luma Gen 2 - The Future of Social Gaming</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 20px;
        }
        .container { max-width: 800px; }
        h1 { font-size: 3rem; margin-bottom: 20px; background: linear-gradient(45deg, #FFD700, #FFA500); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        p { font-size: 1.2rem; margin-bottom: 30px; opacity: 0.9; }
        .btn { 
            display: inline-block;
            padding: 15px 30px;
            background: linear-gradient(45deg, #FF6B6B, #FF8E53);
            color: white;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 600;
            transition: transform 0.3s ease;
        }
        .btn:hover { transform: translateY(-3px); }
        .stats { display: flex; justify-content: center; gap: 40px; margin: 30px 0; }
        .stat { text-align: center; }
        .stat-number { font-size: 2rem; font-weight: bold; color: #FFD700; }
        .features { margin-top: 40px; }
        .feature { margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Luma Gen 2</h1>
        <p>The Future of Social Gaming</p>
        <p>Experience the next generation of Luma with 3D gaming, AI-powered experiences, and a complete metaverse platform launching in 2025.</p>
        
        <div class="stats">
            <div class="stat">
                <div class="stat-number">15,420+</div>
                <div>Pre-registered</div>
            </div>
            <div class="stat">
                <div class="stat-number">2025</div>
                <div>Launch Year</div>
            </div>
        </div>
        
        <a href="#" class="btn" onclick="alert('Pre-registration coming soon!')">🚀 Pre-register Now</a>
        
        <div class="features">
            <h2>🎮 Gen 2 Features</h2>
            <div class="feature">🎮 Luma Game Engine - Full 3D gaming platform</div>
            <div class="feature">🌐 Metaverse integration and virtual worlds</div>
            <div class="feature">🎯 Advanced AI with Gen 2 capabilities</div>
            <div class="feature">🎨 Real-time 3D content creation tools</div>
            <div class="feature">🎪 Interactive live events and concerts</div>
            <div class="feature">🎲 Built-in game marketplace</div>
        </div>
    </div>
</body>
</html>`;
      res.setHeader('Content-Type', 'text/html');
      res.send(fallbackHtml);
    });
});


// Pre-registration API endpoints
app.get('/api/preregistration/stats', (req, res) => {
  try {
    // Update stats based on actual registrations
    const totalRegistrations = preRegistrations.length + stats.totalRegistrations;
    const earlyAccessCount = preRegistrations.filter(reg => {
      const regDate = new Date(reg.timestamp);
      const earlyAccessCutoff = new Date('2025-01-01');
      return regDate < earlyAccessCutoff;
    }).length;
    
    const betaAccessCount = preRegistrations.filter(reg => {
      const regDate = new Date(reg.timestamp);
      const betaAccessCutoff = new Date('2025-03-01');
      return regDate < betaAccessCutoff;
    }).length;

    const updatedStats = {
      totalRegistrations,
      earlyAccessCount,
      betaAccessCount,
      lastUpdated: new Date().toISOString()
    };

    res.json(updatedStats);
  } catch (error) {
    console.error('Error getting pre-registration stats:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

app.post('/api/preregistration/register', (req, res) => {
  try {
    const { email, deviceId, platform, timestamp, preferences, referralCode } = req.body;

    // Validate required fields
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    // Check if already registered
    const existingRegistration = preRegistrations.find(
      reg => reg.email.toLowerCase() === email.toLowerCase()
    );

    if (existingRegistration) {
      return res.status(409).json({ 
        error: 'Email already registered',
        registration: existingRegistration
      });
    }

    // Determine if user should be auto-selected for testing
    const isAutoSelected = determineAutoSelection(email, referralCode);

    // Create new registration
    const newRegistration = {
      email: email.toLowerCase().trim(),
      deviceId: deviceId || `device-${Date.now()}`,
      platform: platform || 'unknown',
      timestamp: timestamp || new Date().toISOString(),
      preferences: {
        earlyAccess: true,
        betaTesting: true,
        marketingEmails: true,
        notifications: true,
        ...preferences
      },
      status: isAutoSelected ? 'early_access' : 'confirmed',
      registrationId: `reg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      referralCode: referralCode || null,
      isAutoSelected: isAutoSelected,
      testingAccess: isAutoSelected ? {
        granted: true,
        grantedAt: new Date().toISOString(),
        accessType: 'auto_selection',
        reason: getAutoSelectionReason(email, referralCode)
      } : null
    };

    // Add to storage
    preRegistrations.push(newRegistration);

    // Update stats
    stats.totalRegistrations = preRegistrations.length + 15420; // Base number
    stats.lastUpdated = new Date().toISOString();

    console.log(`New pre-registration: ${email} (${newRegistration.registrationId}) - Auto-selected: ${isAutoSelected}`);

    res.status(201).json({
      success: true,
      message: isAutoSelected ? 'Pre-registration successful! You have been automatically selected for early testing access.' : 'Pre-registration successful',
      registration: newRegistration,
      autoSelected: isAutoSelected,
      testingAccess: newRegistration.testingAccess,
      stats: {
        totalRegistrations: stats.totalRegistrations,
        earlyAccessCount: preRegistrations.filter(reg => reg.status === 'early_access').length,
        betaAccessCount: preRegistrations.filter(reg => reg.status === 'confirmed').length
      }
    });

  } catch (error) {
    console.error('Error processing pre-registration:', error);
    res.status(500).json({ error: 'Failed to process pre-registration' });
  }
});

// Function to determine if user should be auto-selected for testing
function determineAutoSelection(email, referralCode) {
  // Auto-select users with specific email domains (friends and family)
  const familyDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'];
  const emailDomain = email.split('@')[1]?.toLowerCase();
  
  // Auto-select if using family-friendly email domains
  if (familyDomains.includes(emailDomain)) {
    return true;
  }
  
  // Auto-select if referral code is present (indicating friend/family referral)
  if (referralCode) {
    return true;
  }
  
  // Auto-select based on email pattern (for testing purposes)
  const testPatterns = ['test', 'demo', 'family', 'friend', 'beta'];
  const emailLower = email.toLowerCase();
  if (testPatterns.some(pattern => emailLower.includes(pattern))) {
    return true;
  }
  
  // Random selection for 70% of users (for testing purposes)
  return Math.random() < 0.7;
}

// Function to get auto-selection reason
function getAutoSelectionReason(email, referralCode) {
  const familyDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'];
  const emailDomain = email.split('@')[1]?.toLowerCase();
  
  if (familyDomains.includes(emailDomain)) {
    return 'Family/Friend email domain detected';
  }
  
  if (referralCode) {
    return 'Referred by friend or family member';
  }
  
  const testPatterns = ['test', 'demo', 'family', 'friend', 'beta'];
  const emailLower = email.toLowerCase();
  if (testPatterns.some(pattern => emailLower.includes(pattern))) {
    return 'Test email pattern detected';
  }
  
  return 'Random selection for testing';
}

app.get('/api/preregistration/check/:email', (req, res) => {
  try {
    const { email } = req.params;
    const registration = preRegistrations.find(
      reg => reg.email.toLowerCase() === email.toLowerCase()
    );

    if (registration) {
      res.json({
        isRegistered: true,
        registration: {
          email: registration.email,
          timestamp: registration.timestamp,
          status: registration.status,
          preferences: registration.preferences
        }
      });
    } else {
      res.json({
        isRegistered: false
      });
    }
  } catch (error) {
    console.error('Error checking registration status:', error);
    res.status(500).json({ error: 'Failed to check registration status' });
  }
});

app.put('/api/preregistration/preferences', (req, res) => {
  try {
    const { email, preferences } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const registration = preRegistrations.find(
      reg => reg.email.toLowerCase() === email.toLowerCase()
    );

    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    // Update preferences
    registration.preferences = {
      ...registration.preferences,
      ...preferences
    };

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      registration: {
        email: registration.email,
        preferences: registration.preferences,
        timestamp: registration.timestamp,
        status: registration.status
      }
    });

  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// Health check
app.get('/v1/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    updates: Object.keys(updates)
  });
});

// For Vercel deployment
if (process.env.VERCEL) {
  // Export for Vercel serverless functions
  module.exports = app;
} else {
  // Local development
  app.listen(PORT, () => {
    console.log(`🚀 Luma Update Server running on port ${PORT}`);
    console.log(`📱 Available updates: ${Object.keys(updates).join(', ')}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/v1/health`);
  });
} 