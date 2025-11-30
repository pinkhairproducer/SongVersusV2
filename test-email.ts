import { sendWelcomeEmail } from './server/email';

async function testEmail() {
  console.log('Sending test email to vinnywhoo@gmail.com...');
  try {
    const result = await sendWelcomeEmail('vinnywhoo@gmail.com', 'Test User');
    console.log('Email sent successfully!', result);
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}

testEmail();
