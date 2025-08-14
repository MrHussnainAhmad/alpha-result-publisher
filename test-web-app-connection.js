const axios = require('axios');

// Test the web app's API configuration
async function testWebAppConnection() {
  try {
    console.log('🧪 Testing Web App Connection to Backend...\n');

    // Test 1: Check if backend is accessible
    console.log('1️⃣ Testing backend connectivity...');
    const healthCheck = await axios.get('http://localhost:5000/api/admin/stats');
    console.log('✅ Backend is accessible');
    console.log('   Response status:', healthCheck.status);

    // Test 2: Test admin signup endpoint
    console.log('\n2️⃣ Testing admin signup endpoint...');
    const timestamp = Date.now();
    const adminData = {
      fullname: `Web App Test Admin ${timestamp}`,
      username: `webapptest${timestamp}`,
      email: `webapptest${timestamp}@school.com`,
      password: "testpass123",
      role: "admin"
    };

    const signupResponse = await axios.post('http://localhost:5000/api/admin/signup', adminData);
    console.log('✅ Admin signup endpoint working');
    console.log('   Response:', signupResponse.data.message);

    // Test 3: Test admin login endpoint
    console.log('\n3️⃣ Testing admin login endpoint...');
    const loginResponse = await axios.post('http://localhost:5000/api/admin/login', {
      email: adminData.email,
      password: adminData.password
    });
    console.log('✅ Admin login endpoint working');
    console.log('   Response:', loginResponse.data.message);
    console.log('   Token received:', loginResponse.data.token ? 'Yes' : 'No');

    console.log('\n🎉 All web app connection tests passed!');
    console.log('\n📝 Test Admin Credentials:');
    console.log('   Email:', adminData.email);
    console.log('   Password:', adminData.password);
    console.log('\n💡 You can now use the web app to create admin accounts!');

  } catch (error) {
    console.error('\n❌ Web app connection test failed:');
    if (error.response) {
      console.error('Error:', error.response.data.message);
      console.error('Status:', error.response.status);
    } else if (error.code === 'ECONNREFUSED') {
      console.error('❌ Connection refused - Backend server is not running');
      console.log('\n💡 Make sure to:');
      console.log('   1. Start your backend server: npm start (in alpha folder)');
      console.log('   2. Ensure it\'s running on localhost:5000');
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run the test
testWebAppConnection();
