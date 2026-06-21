const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/admin/users?limit=100',
  method: 'GET',
  headers: {
    // Assuming we can test it without auth or with a dummy if middleware allows, 
    // wait, middleware requires auth. We must connect directly to db or bypass.
    // Actually, I just need to verify if the server is up and returning 401 or 500.
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('STATUS:', res.statusCode, 'DATA:', data));
});
req.on('error', e => console.error(e));
req.end();
