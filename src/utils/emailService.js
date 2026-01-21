import nodemailer from "nodemailer";

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

// Helper to format OTP email body
const otpHtml = (otp) => `
  <div style="font-family: Arial, sans-serif; padding: 20px;">
    <h2>Admin Login OTP</h2>
    <p>Your OTP for admin login is:</p>
    <h1 style="color: #2196F3; letter-spacing: 3px;">${otp}</h1>
    <p style="color: #666;">
      This OTP will expire in <strong>10 minutes</strong>.
    </p>
    <p style="color: #999; font-size: 12px;">
      If you did not request this, please ignore this email.
    </p>
  </div>
`;

if (EMAIL_USER && EMAIL_PASS) {
  console.log("✅ Gmail configured with user:", EMAIL_USER);
} else {
  console.error("❌ Gmail NOT configured properly - EMAIL_USER:", EMAIL_USER, "EMAIL_PASS exists:", !!EMAIL_PASS);
}

// Create transporter with proper Gmail config
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Nodemailer transporter error:", error);
  } else {
    console.log("✅ Nodemailer transporter ready");
  }
});

const sendViaGmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: EMAIL_USER,
      to: email,
      subject: "Your OTP Code - Admin Login",
      html: otpHtml(otp),
    };

    console.log("📧 Attempting to send OTP to:", email);
    const startTime = Date.now();
    const result = await transporter.sendMail(mailOptions);
    const duration = Date.now() - startTime;
    console.log(`✅ OTP email sent successfully in ${duration}ms. Response ID:`, result.response);
    return result;
  } catch (error) {
    console.error("❌ Error sending OTP email:", error.message);
    console.error("   Error code:", error.code);
    console.error("   Full error:", error);
    throw error;
  }
};

export const sendOTPEmail = async (email, otp) => {
  if (!EMAIL_USER || !EMAIL_PASS) {
    const error = "Gmail env vars missing - EMAIL_USER: " + EMAIL_USER + ", EMAIL_PASS exists: " + !!EMAIL_PASS;
    console.error("❌", error);
    throw new Error(error);
  }

  const result = await sendViaGmail(email, otp);
  console.log("✅ OTP email function completed for", email);
  return { success: true, response: result.response };
};
