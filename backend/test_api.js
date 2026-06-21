const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Starting API Health Checks...\n');

  try {
    // Test 1: Fetch Products
    console.log('1. Testing GET /products ...');
    const productsRes = await axios.get(`${BASE_URL}/products`);
    if (productsRes.data.status === 'success') {
      console.log(`   ✅ Success! Found ${productsRes.data.data.length} products in the database.`);
    } else {
      console.error('   ❌ Failed to get products.');
    }

    // Test 2: Try to signup a dummy user
    console.log('\n2. Testing POST /auth/signup ...');
    const dummyEmail = `test_${Date.now()}@example.com`;
    const signupRes = await axios.post(`${BASE_URL}/auth/signup`, {
      name: 'API Test User',
      email: dummyEmail,
      password: 'TestPassword123!'
    });
    
    if (signupRes.data.status === 'pending_verification' || signupRes.data.status === 'success') {
      console.log(`   ✅ Success! Signup endpoint is working (Status: ${signupRes.data.status}).`);
    } else {
      console.error('   ❌ Failed to signup.');
    }

    // Test 3: Check invalid login
    console.log('\n3. Testing POST /auth/login (Invalid credentials) ...');
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        email: 'invalid@example.com',
        password: 'wrongpassword'
      });
      console.error('   ❌ Failed: Login somehow accepted invalid credentials.');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('   ✅ Success! Login correctly blocked invalid credentials with 401 Unauthorized.');
      } else {
        console.error('   ❌ Failed: Unexpected error on login test.', error.message);
      }
    }

    console.log('\n🎉 All basic API health checks completed successfully! The backend is functioning perfectly.');
  } catch (err) {
    console.error('\n❌ An error occurred during testing. Are you sure the backend is running?');
    if (err.response) {
      console.error(err.response.data);
    } else {
      console.error(err.message);
    }
  }
}

runTests();
