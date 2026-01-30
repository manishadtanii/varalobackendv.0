import nodemailer from "nodemailer";

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_PASS = process.env.GMAIL_PASS;
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@digicots.com";

// Helper to format OTP email body
const otpHtml = (otp) => `
  <div style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; border-radius: 8px;">
    <h2 style="color: #333;">Admin Login OTP</h2>
    <p style="color: #666;">Your OTP for admin login is:</p>
    <h1 style="color: #2196F3; letter-spacing: 3px; background: white; padding: 20px; border-radius: 4px; text-align: center;">${otp}</h1>
    <p style="color: #666;">
      This OTP will expire in <strong>10 minutes</strong>.
    </p>
    <p style="color: #999; font-size: 12px;">
      If you did not request this, please ignore this email.
    </p>
  </div>
`;

if (!GMAIL_USER || !GMAIL_PASS) {
  console.error("❌ Gmail credentials NOT configured - GMAIL_USER and GMAIL_PASS are missing");
  console.log("⚠️  Email service will fail until Gmail credentials are added to environment variables");
} else {
  console.log("✅ Gmail configured successfully");
}

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASS
  }
});

export const sendOTPEmail = async (email, otp) => {
  if (!GMAIL_USER || !GMAIL_PASS) {
    const error = "Gmail credentials missing - GMAIL_USER and GMAIL_PASS env vars not set. Please add them to environment variables.";
    console.error("❌", error);
    throw new Error(error);
  }

  try {
    console.log("📧 Sending OTP email via Gmail to:", email);
    const startTime = Date.now();

    const mailOptions = {
      from: FROM_EMAIL,
      to: email,
      subject: "Your OTP Code - Admin Login",
      html: otpHtml(otp),
    };

    const result = await transporter.sendMail(mailOptions);
    const duration = Date.now() - startTime;

    console.log(`✅ OTP email sent successfully in ${duration}ms. Message ID:`, result.messageId);
    return { success: true, response: result.messageId };
  } catch (error) {
    console.error("❌ Error sending OTP email:", error.message);
    throw error;
  }
};
