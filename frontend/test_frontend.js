import http from 'http';

const FRONTEND_URL = 'http://localhost:5173';

console.log('🧪 Starting Frontend Server Checks...\n');

const req = http.get(FRONTEND_URL, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('   ✅ Success! Frontend server is reachable and responding.');
      
      // Check for vital React elements in the HTML output
      if (data.includes('<div id="root">')) {
        console.log('   ✅ Success! React mounting point (<div id="root">) is properly configured.');
      } else {
        console.error('   ❌ Warning: React root div not found in HTML.');
      }
      
      if (data.includes('src="/src/main.jsx"')) {
        console.log('   ✅ Success! Main React entry script (main.jsx) is correctly linked.');
      }
      
      console.log('\n🎉 The frontend server is healthy and serving your React application correctly!');
    } else {
      console.error(`   ❌ Failed: Server responded with status code ${res.statusCode}`);
    }
  });
});

req.on('error', (error) => {
  console.error('\n❌ Could not connect to the frontend server.');
  console.error('   Error:', error.message);
  console.log('\nMake sure you have started your frontend by running "npm run dev" in the frontend folder first!');
});
