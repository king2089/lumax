// In-memory storage for pre-registrations (in production, use a database)
let preRegistrations = [];
let stats = {
  totalRegistrations: 15420,
  earlyAccessCount: 0,
  betaAccessCount: 0,
  lastUpdated: new Date().toISOString()
};

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

// Luma AI - Future Features and Timeline Information
const lumaAI = {
  // Current Phase (Q2 2025)
  currentPhase: {
    name: "Pre-registration & Early Access",
    description: "We're currently in the pre-registration phase, building our community of early adopters and gathering feedback.",
    features: [
      "Exclusive pre-registration access",
      "Early access to beta features",
      "Priority support and feedback channels",
      "Special founder member benefits"
    ],
    timeline: "Q2 2025 - Q3 2025"
  },

  // Upcoming Phases
  upcomingPhases: [
    {
      name: "Beta Launch (Q3 2025)",
      description: "Limited beta release with core features for early adopters.",
      features: [
        "Core social networking features",
        "Basic AI-powered content creation",
        "Community building tools",
        "Feedback and iteration system"
      ],
      timeline: "July 2025 - September 2025"
    },
    {
      name: "Public Launch (Q4 2025)",
      description: "Full public release with advanced features and expanded user base.",
      features: [
        "Advanced AI content generation",
        "Live streaming capabilities",
        "Monetization features",
        "Advanced community tools"
      ],
      timeline: "October 2025 - December 2025"
    },
    {
      name: "Gen2 AI Platform (Q1 2026)",
      description: "Next-generation AI features and advanced capabilities.",
      features: [
        "Gen2 AI content creation",
        "Advanced personalization",
        "Enterprise features",
        "Global expansion"
      ],
      timeline: "January 2026 - March 2026"
    }
  ],

  // Key Features Overview
  keyFeatures: {
    ai: {
      title: "AI-Powered Content Creation",
      description: "Advanced AI that helps you create, edit, and enhance content automatically.",
      benefits: [
        "Automated content generation",
        "Smart editing suggestions",
        "Style transfer and enhancement",
        "Multi-format content creation"
      ]
    },
    social: {
      title: "Next-Gen Social Networking",
      description: "Revolutionary social platform with AI-enhanced interactions.",
      benefits: [
        "AI-curated content feeds",
        "Smart matching and connections",
        "Enhanced privacy controls",
        "Real-time collaboration tools"
      ]
    },
    monetization: {
      title: "Creator Monetization",
      description: "Multiple revenue streams for content creators and influencers.",
      benefits: [
        "Direct fan support",
        "AI-powered sponsorship matching",
        "Content licensing opportunities",
        "Merchandise integration"
      ]
    }
  },

  // Pre-registration Benefits
  preRegistrationBenefits: [
    {
      title: "Early Access Priority",
      description: "Be among the first to experience new features and provide feedback.",
      priority: "High"
    },
    {
      title: "Exclusive Founder Badge",
      description: "Special recognition as an early supporter of the platform.",
      priority: "Medium"
    },
    {
      title: "Beta Testing Access",
      description: "Direct access to beta features before public release.",
      priority: "High"
    },
    {
      title: "Community Influence",
      description: "Help shape the future of the platform through feedback and suggestions.",
      priority: "Medium"
    },
    {
      title: "Special Pricing",
      description: "Exclusive pricing for premium features and early access.",
      priority: "High"
    }
  ],

  // Technology Stack
  technology: {
    frontend: ["React Native", "Expo", "TypeScript"],
    backend: ["Node.js", "Express", "Supabase"],
    ai: ["OpenAI GPT", "Custom AI Models", "Machine Learning"],
    infrastructure: ["Cloudflare", "Vercel", "Netlify"],
    payments: ["Stripe", "Apple Pay", "Google Pay"]
  }
};

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

exports.handler = async (event, context) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  const { path, httpMethod, body } = event;
  
  try {
    // Parse the path to determine the endpoint
    const pathParts = path.split('/').filter(Boolean);
    
    // Health check endpoint
    if (pathParts.includes('health')) {
      return {
        statusCode: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          service: 'Luma Pre-registration API',
          version: '1.0.0'
        })
      };
    }

    // Pre-registration stats endpoint
    if (pathParts.includes('preregistration') && pathParts.includes('stats') && httpMethod === 'GET') {
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

      return {
        statusCode: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedStats)
      };
    }

    // Pre-registration register endpoint
    if (pathParts.includes('preregistration') && pathParts.includes('register') && httpMethod === 'POST') {
      const requestBody = JSON.parse(body || '{}');
      const { email, deviceId, platform, timestamp, preferences, referralCode } = requestBody;

      // Validate required fields
      if (!email || !email.includes('@')) {
        return {
          statusCode: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ error: 'Valid email is required' })
        };
      }

      // Check if already registered
      const existingRegistration = preRegistrations.find(
        reg => reg.email.toLowerCase() === email.toLowerCase()
      );

      if (existingRegistration) {
        return {
          statusCode: 409,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            error: 'Email already registered',
            registration: existingRegistration
          })
        };
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
      stats.totalRegistrations = preRegistrations.length + 15420;
      stats.lastUpdated = new Date().toISOString();

      return {
        statusCode: 201,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
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
        })
      };
    }

    // Pre-registration check endpoint
    if (pathParts.includes('preregistration') && pathParts.includes('check') && httpMethod === 'GET') {
      const email = pathParts[pathParts.length - 1]; // Get email from URL
      const registration = preRegistrations.find(
        reg => reg.email.toLowerCase() === email.toLowerCase()
      );

      if (registration) {
        return {
          statusCode: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            isRegistered: true,
            registration: {
              email: registration.email,
              timestamp: registration.timestamp,
              status: registration.status,
              preferences: registration.preferences
            }
          })
        };
      } else {
        return {
          statusCode: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            isRegistered: false
          })
        };
      }
    }

    // Luma AI Endpoints
    if (pathParts.includes('ai') && pathParts.includes('future') && httpMethod === 'GET') {
      return {
        statusCode: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: true,
          data: {
            currentPhase: lumaAI.currentPhase,
            upcomingPhases: lumaAI.upcomingPhases,
            keyFeatures: lumaAI.keyFeatures,
            preRegistrationBenefits: lumaAI.preRegistrationBenefits,
            technology: lumaAI.technology,
            timestamp: new Date().toISOString()
          }
        })
      };
    }

    if (pathParts.includes('ai') && pathParts.includes('timeline') && httpMethod === 'GET') {
      const timeline = [
        {
          date: 'Q2 2025',
          phase: 'Pre-registration',
          status: 'Active',
          description: 'Building community and gathering early adopters'
        },
        {
          date: 'Q3 2025',
          phase: 'Beta Launch',
          status: 'Upcoming',
          description: 'Limited beta release with core features'
        },
        {
          date: 'Q4 2025',
          phase: 'Public Launch',
          status: 'Planned',
          description: 'Full public release with advanced features'
        },
        {
          date: 'Q1 2026',
          phase: 'Gen2 AI Platform',
          status: 'Development',
          description: 'Next-generation AI features and capabilities'
        }
      ];

      return {
        statusCode: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: true,
          data: {
            timeline,
            currentPhase: 'Pre-registration',
            nextMilestone: 'Beta Launch (Q3 2025)',
            timestamp: new Date().toISOString()
          }
        })
      };
    }

    if (pathParts.includes('ai') && pathParts.includes('features') && httpMethod === 'GET') {
      return {
        statusCode: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: true,
          data: {
            features: lumaAI.keyFeatures,
            upcomingFeatures: lumaAI.upcomingPhases.map(phase => ({
              phase: phase.name,
              features: phase.features,
              timeline: phase.timeline
            })),
            timestamp: new Date().toISOString()
          }
        })
      };
    }

    // Root endpoint
    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Luma Gen 2 Backend is running!',
        timestamp: new Date().toISOString(),
        status: 'success',
        version: '1.0.0',
        endpoints: {
          health: '/api/health',
          preregistrationStats: '/api/preregistration/stats',
          preregistrationRegister: '/api/preregistration/register',
          preregistrationCheck: '/api/preregistration/check/:email',
          aiFuture: '/api/ai/future',
          aiTimeline: '/api/ai/timeline',
          aiFeatures: '/api/ai/features'
        }
      })
    };

  } catch (error) {
    console.error('Error processing request:', error);
    return {
      statusCode: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
}; 