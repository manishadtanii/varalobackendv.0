import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = "noreply@digicots.com"; // Resend requires domain email

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

if (!RESEND_API_KEY) {
  console.error("❌ Resend API key NOT configured - RESEND_API_KEY is missing");
} else {
  console.log("✅ Resend configured successfully");
}

const resend = new Resend(RESEND_API_KEY);

export const sendOTPEmail = async (email, otp) => {
  if (!RESEND_API_KEY) {
    const error = "Resend API key missing - RESEND_API_KEY env var not set";
    console.error("❌", error);
    throw new Error(error);
  }

  try {
    console.log("📧 Sending OTP email via Resend to:", email);
    const startTime = Date.now();

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Your OTP Code - Admin Login",
      html: otpHtml(otp),
    });

    const duration = Date.now() - startTime;

    if (result.error) {
      console.error("❌ Resend API error:", result.error);
      throw new Error(result.error.message);
    }

    console.log(`✅ OTP email sent successfully in ${duration}ms. Email ID:`, result.data?.id);
    return { success: true, response: result.data?.id };
  } catch (error) {
    console.error("❌ Error sending OTP email:", error.message);
    throw error;
  }
};
