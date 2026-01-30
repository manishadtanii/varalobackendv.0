import sgMail from "@sendgrid/mail";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
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

if (!SENDGRID_API_KEY) {
  console.error("❌ SendGrid API key NOT configured - SENDGRID_API_KEY is missing");
  console.log("⚠️  Email service will fail until SENDGRID_API_KEY is added to environment variables");
} else {
  sgMail.setApiKey(SENDGRID_API_KEY);
  console.log("✅ SendGrid configured successfully");
  console.log("🔍 API key starts with:", SENDGRID_API_KEY.substring(0, 5) + "...");
  console.log("🔍 API key length:", SENDGRID_API_KEY.length);
}

export const sendOTPEmail = async (email, otp) => {
  if (!SENDGRID_API_KEY) {
    const error = "SendGrid API key missing - SENDGRID_API_KEY env var not set. Please add it to environment variables.";
    console.error("❌", error);
    throw new Error(error);
  }

  try {
    console.log("📧 Sending OTP email via SendGrid to:", email);
    const startTime = Date.now();

    const msg = {
      to: email,
      from: FROM_EMAIL,
      subject: "Your OTP Code - Admin Login",
      html: otpHtml(otp),
    };

    const result = await sgMail.send(msg);
    const duration = Date.now() - startTime;

    console.log(`✅ OTP email sent successfully in ${duration}ms. Message ID:`, result[0]?.headers?.['x-message-id']);
    return { success: true, response: result[0]?.headers?.['x-message-id'] };
  } catch (error) {
    console.error("❌ Error sending OTP email:", error.message);
    throw error;
  }
};
