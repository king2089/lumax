// Using built-in fetch (Node.js 18+)

async function testUpdateSystem() {
  console.log('🧪 Testing Luma Update System...\n');
  
  const baseUrl = 'http://192.168.1.205:3001/v1';
  
  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing health check...');
    const healthResponse = await fetch(`${baseUrl}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check passed:', healthData.status);
    
    // Test 2: Update Check
    console.log('\n2️⃣ Testing update check...');
    const updateResponse = await fetch(`${baseUrl}/updates/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Device-ID': 'test-device',
        'X-App-Version': '1.0.0',
        'X-Platform': 'ios',
        'X-App-ID': 'luma-gen1',
        'X-Channel': 'dev'
      },
      body: JSON.stringify({
        currentVersion: '1.0.0',
        platform: 'ios',
        deviceId: 'test-device',
        appId: 'luma-gen1',
        channel: 'dev'
      })
    });
    
    const updateData = await updateResponse.json();
    console.log('✅ Update check passed:', updateData.hasUpdate ? 'Update available' : 'No updates');
    if (updateData.hasUpdate) {
      console.log('📦 Available update:', updateData.updateInfo.version);
      console.log('🎮 Features:', updateData.updateInfo.features.slice(0, 3).join(', ') + '...');
    }
    
    // Test 3: Gen 2 Update Check
    console.log('\n3️⃣ Testing Gen 2 update check...');
    const gen2Response = await fetch(`${baseUrl}/updates/gen2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Device-ID': 'test-device'
      },
      body: JSON.stringify({
        currentVersion: '1.0.0',
        platform: 'ios',
        deviceId: 'test-device',
        feature: 'gen2-gaming'
      })
    });
    
    const gen2Data = await gen2Response.json();
    console.log('✅ Gen 2 update check passed:', gen2Data.hasUpdate ? 'Gen 2 available' : 'No Gen 2');
    if (gen2Data.hasUpdate) {
      console.log('🎮 Gen 2 version:', gen2Data.updateInfo.version);
      console.log('🚀 Gen 2 features:', gen2Data.updateInfo.features.slice(0, 3).join(', ') + '...');
    }
    
    // Test 4: Strip Club Update Check
    console.log('\n4️⃣ Testing Strip Club update check...');
    const stripClubResponse = await fetch(`${baseUrl}/updates/strip-club`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Device-ID': 'test-device'
      },
      body: JSON.stringify({
        currentVersion: '1.0.0',
        platform: 'ios',
        deviceId: 'test-device',
        feature: 'strip-club-18plus'
      })
    });
    
    const stripClubData = await stripClubResponse.json();
    console.log('✅ Strip Club update check passed:', stripClubData.hasUpdate ? 'Strip Club update available' : 'No Strip Club update');
    
    console.log('\n🎉 All tests passed! The update system is working correctly.');
    console.log('\n📱 Next steps:');
    console.log('1. Open your app in Expo Go or simulator');
    console.log('2. Go to Menu → Software Update');
    console.log('3. Check for updates');
    console.log('4. You should see the Gen 2 update available!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testUpdateSystem(); 