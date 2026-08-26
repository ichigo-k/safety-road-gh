import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(toEmail: string, verificationCode: string) {
  if (!process.env.SMTP_USER || process.env.SMTP_USER === 'your-email@gmail.com') {
    console.log(`[DEV MODE] Email verification code for ${toEmail}: ${verificationCode}`);
    return;
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || 'Safety Road GH <no-reply@safetyroad.gov.gh>',
    to: toEmail,
    subject: 'Safety Road GH — Email Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #0f172a; color: #ffffff; border-radius: 10px;">
        <h2 style="color: #f59e0b;">Safety Road GH</h2>
        <p>Your 6-digit email verification code is:</p>
        <div style="font-size: 28px; font-weight: bold; color: #f59e0b; letter-spacing: 4px; padding: 10px 0;">
          ${verificationCode}
        </div>
        <p>Enter this code in your mobile application to activate your citizen account.</p>
        <hr style="border-color: #334155; margin-top: 20px;" />
        <p style="font-size: 11px; color: #94a3b8;">Ghana National Road Accident & Hazard Reporting System</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendPasswordResetEmail(toEmail: string, resetCode: string) {
  if (!process.env.SMTP_USER || process.env.SMTP_USER === 'your-email@gmail.com') {
    console.log(`[DEV MODE] Password reset code for ${toEmail}: ${resetCode}`);
    return;
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || 'Safety Road GH <no-reply@safetyroad.gov.gh>',
    to: toEmail,
    subject: 'Safety Road GH — Password Reset Code',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #0f172a; color: #ffffff; border-radius: 10px;">
        <h2 style="color: #f59e0b;">Safety Road GH</h2>
        <p>You requested a password reset. Your 6-digit reset code is:</p>
        <div style="font-size: 28px; font-weight: bold; color: #ef4444; letter-spacing: 4px; padding: 10px 0;">
          ${resetCode}
        </div>
        <p>If you did not request a password reset, please ignore this email.</p>
        <hr style="border-color: #334155; margin-top: 20px;" />
        <p style="font-size: 11px; color: #94a3b8;">Ghana National Road Accident & Hazard Reporting System</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
