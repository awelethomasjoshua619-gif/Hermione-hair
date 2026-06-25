const { Resend } = require('resend');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
  console.log('Testing Resend email delivery...');
  console.log('API Key:', process.env.RESEND_API_KEY ? 'Present (starts with ' + process.env.RESEND_API_KEY.slice(0, 7) + '...)' : 'Missing');

  const { data, error } = await resend.emails.send({
    from: 'Hermione Hair <no-reply@hermionehair.com>',
    to: 'dragon66199@gmail.com', // Replace with the email you signed up with if different
    subject: 'Resend API Test 🌿',
    html: '<p>If you see this, Resend integration is working perfectly!</p>',
  });

  if (error) {
    console.error('Resend API Error details:', JSON.stringify(error, null, 2));
  } else {
    console.log('Resend API Success details:', JSON.stringify(data, null, 2));
  }
}

testEmail();
