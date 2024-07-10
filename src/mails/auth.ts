import transport from "../lib/email";

async function resetPasswordMail(email: string, token: string) {
  try {
    const transporter = await transport();
    await transporter.sendMail({
      from: `${process.env.APPLICATION_NAME} <${process.env.EMAIL_SENDER}>`,
      to: email,
      subject: "Password Reset",
      html: `<p>Click the link below to reset your password:</p>
             <a href="${process.env.FRONTEND_URL}/reset-password?token=${token}">Reset Password</a>`,
    });
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

async function verificationMail(email: string, token: string) {
  try {
    const transporter = await transport();
    await transporter.sendMail({
      from: `${process.env.APPLICATION_NAME} <${process.env.EMAIL_SENDER}>`,
      to: email,
      subject: "Email Verification",
      html: `<p>Click the link below to verify your email:</p>
             <a href="${process.env.FRONTEND_URL}/verify-email?token=${token}">Verify Email</a>`,
    });
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

export default {
  resetPassword: resetPasswordMail,
  verificationEmail: verificationMail,
};
