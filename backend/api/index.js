const express = require('express');
const cors = require('cors');

// In-memory storage for pre-registrations (in production, use a database)
let preRegistrations = [];
let stats = {
  totalRegistrations: 15420,
  earlyAccessCount: 0,
  betaAccessCount: 0,
  lastUpdated: new Date().toISOString()
};

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:19006', 'https://luma-preregistration.vercel.app', 'https://lumax.vercel.app'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

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
  
  // Random selection for 30% of users (for testing purposes)
  return Math.random() < 0.3;
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

// Routes

// GET /api/preregistration/stats - Get pre-registration statistics
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

// POST /api/preregistration/register - Register for pre-registration
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

// GET /api/preregistration/check/:email - Check if email is registered
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Luma Pre-registration API',
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Luma Gen 2 Backend is running!',
    timestamp: new Date().toISOString(),
    status: 'success',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      preregistrationStats: '/api/preregistration/stats',
      preregistrationRegister: '/api/preregistration/register',
      preregistrationCheck: '/api/preregistration/check/:email'
    }
  });
});

// Export for Vercel
module.exports = app; 