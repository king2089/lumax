const express = require('express');
const router = express.Router();

// In-memory storage for pre-registrations (in production, use a database)
let preRegistrations = [];
let stats = {
  totalRegistrations: 15420,
  earlyAccessCount: 0,
  betaAccessCount: 0,
  lastUpdated: new Date().toISOString()
};

// Middleware to parse JSON
router.use(express.json());

// GET /api/preregistration/stats - Get pre-registration statistics
router.get('/stats', (req, res) => {
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
router.post('/register', (req, res) => {
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

// GET /api/preregistration/check/:email - Check if email is registered
router.get('/check/:email', (req, res) => {
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

// PUT /api/preregistration/preferences - Update preferences
router.put('/preferences', (req, res) => {
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

// GET /api/preregistration/list - Get all registrations (admin only)
router.get('/list', (req, res) => {
  try {
    // In production, add authentication/authorization here
    const { limit = 100, offset = 0 } = req.query;
    
    const limitedRegistrations = preRegistrations
      .slice(parseInt(offset), parseInt(offset) + parseInt(limit))
      .map(reg => ({
        email: reg.email,
        platform: reg.platform,
        timestamp: reg.timestamp,
        status: reg.status,
        preferences: reg.preferences
      }));

    res.json({
      registrations: limitedRegistrations,
      total: preRegistrations.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error getting registrations list:', error);
    res.status(500).json({ error: 'Failed to get registrations' });
  }
});

// POST /api/preregistration/export - Export registrations (admin only)
router.post('/export', (req, res) => {
  try {
    // In production, add authentication/authorization here
    const exportData = {
      timestamp: new Date().toISOString(),
      totalRegistrations: preRegistrations.length,
      registrations: preRegistrations.map(reg => ({
        email: reg.email,
        platform: reg.platform,
        timestamp: reg.timestamp,
        status: reg.status,
        preferences: reg.preferences
      }))
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="preregistrations-${Date.now()}.json"`);
    res.json(exportData);
  } catch (error) {
    console.error('Error exporting registrations:', error);
    res.status(500).json({ error: 'Failed to export registrations' });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    registrationsCount: preRegistrations.length,
    uptime: process.uptime()
  });
});

module.exports = router; 