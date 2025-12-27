const nodemailer = require("nodemailer");
const { getLocalIPInfo } = require("../utils/ipinfo");


const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const SendMail = async (tomail, subject, message) => {

     const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: tomail,
    subject: subject,
       html: messageTemplate(message), 
  });
    console.log("Message sent: %s", info.messageId);
 
}

const sendWelcomeEmail = async (to, name) => {
  const subject = 'Welcome to Our Service';
  const message = `Hello ${name},<br><br>Welcome to our service! We're glad to have you on board.<br><br>Best regards,<br>The Team`;
  await SendMail(to, subject, message);
}
const sendLoginAlertEmail = async (to, name, time) => {
  const subject = 'New Login Alert';
  const location= await getLocalIPInfo();
  const message = `Hello ${name},<br><br>We noticed a new login to your account on ${time}. If this was not you, please secure your account immediately. <br/> Location: ${location.ip}, ${location.countryCode}, ${location.region}, ${location.city} <br><br>Best regards,<br>The Team`;
  await SendMail(to, subject, message);
}
const sendPasswordResetEmail = async (to, name, resetLink) => {
  const subject = 'Password Reset Request';
  const message = `Hello ${name},<br><br>We received a request to reset your password. Please click the link below to reset it:<br><a href="${resetLink}">Reset Password</a><br><br>If you did not request this, please ignore this email.<br><br>Best regards,<br>The Team`;
  await SendMail(to, subject, message);
}

const sendResetConfirmationEmail = async (to, name) => {
  const subject = 'Password Reset Successful';
  const message = `Hello ${name},<br><br>Your password has been successfully reset. If you did not perform this action, please contact our support team immediately.<br><br>Best regards,<br>The Team`;
  await SendMail(to, subject, message);
}

module.exports = {
    sendWelcomeEmail,
    sendLoginAlertEmail,
    sendPasswordResetEmail,
    sendResetConfirmationEmail
};

const messageTemplate = (message) => {
    return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <div style="background-color: #f4f4f4; padding: 20px;">
        <h2 style="color: #333;">Notification</h2>
      </div>
      <div style="padding: 20px;">
        <p style="font-size: 16px; color: #555;">${message}</p>
      </div>
      <div style="background-color: #f4f4f4; padding: 10px; text-align: center;">
        <p style="font-size: 12px; color: #999;">&copy; 2024 Your Company. All rights reserved.</p>
      </div>
    </div>
  `;    
}

