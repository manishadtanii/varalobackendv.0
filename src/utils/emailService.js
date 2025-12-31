import nodemailer from "nodemailer";
import sgMail from "@sendgrid/mail";

// Helper to format OTP email body
const otpHtml = (otp) => `
  <div style="font-family: Arial, sans-serif; padding: 20px;">
    <h2>Admin Login OTP</h2>
    <p>Your OTP for admin login is:</p>
    <h1 style="color: #2196F3; letter-spacing: 3px;">${otp}</h1>
    <p style="color: #666;">This OTP will expire in <strong>10 minutes</strong>.</p>
    <p style="color: #999; font-size: 12px;">If you did not request this, please ignore this email.</p>
  </div>
`;

let useSendGrid = false;
if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM) {
  try {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    useSendGrid = true;
    console.log('SendGrid configured');
  } catch (err) {
    console.error('Failed to configure SendGrid:', err);
  }
}

// Nodemailer transporter (fallback)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 5000,
  socketTimeout: 10000,
});

transporter.verify()
  .then(() => console.log('Mail transporter verified and ready'))
  .catch(err => console.error('Mail transporter verification failed:', err));

export const sendOTPEmail = async (email, otp) => {
  console.log('sendOTPEmail called for', email, 'useSendGrid:', useSendGrid);

  if (useSendGrid) {
    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM,
      subject: 'Your OTP Code - Admin Login',
      html: otpHtml(otp),
    };
    try {
      await sgMail.send(msg);
      console.log('SendGrid: email sent to', email);
      return { success: true };
    } catch (error) {
      console.error('SendGrid send error:', error);
      // Fall through to nodemailer fallback
    }
  }

  // Nodemailer fallback
  try {
    await transporter.sendMail({
      from: `"Admin Panel" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code - Admin Login",
      html: otpHtml(otp),
    });
    console.log('nodemailer: sendMail success for', email);
    return { success: true };
  } catch (error) {
    console.error("nodemailer Email Error:", error);
    // As a last resort, log OTP to console (dev) and return success so frontend isn't blocked
    console.warn('Falling back: Logging OTP to console for', email, 'OTP:', otp);
    return { success: false, fallbackOtp: otp };
  }
};
