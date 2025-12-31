const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_FROM = process.env.SENDGRID_FROM;

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

if (SENDGRID_API_KEY && SENDGRID_FROM) {
  console.log("SendGrid configured");
} else {
  console.error("❌ SendGrid NOT configured properly");
}

const sendViaSendGrid = async (email, otp) => {
  const body = {
    personalizations: [
      { to: [{ email }], subject: "Your OTP Code - Admin Login" },
    ],
    from: { email: SENDGRID_FROM },
    content: [{ type: "text/html", value: otpHtml(otp) }],
  };

  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`SendGrid API error ${res.status}: ${errText}`);
  }
};

export const sendOTPEmail = async (email, otp) => {
  if (!SENDGRID_API_KEY || !SENDGRID_FROM) {
    throw new Error("SendGrid env vars missing");
  }

  await sendViaSendGrid(email, otp);
  console.log("✅ OTP email sent to", email);
  return { success: true };
};
