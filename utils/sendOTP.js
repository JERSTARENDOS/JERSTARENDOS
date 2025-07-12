const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

  let transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    tls: {
      rejectUnauthorized: false
    },
    requireTLS: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.API_KEY
    }
  });


const sendOTP = async (email, otp) => {

  const res =   await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is ${otp}`
  });
console.log('Email sent:', res);
  if (res.rejected.length > 0) {
    console.error('Failed to send email:', res.rejected);
    throw new Error('Failed to send OTP email');  
  }
console.log('message', res.messageId);
};

module.exports = sendOTP;
