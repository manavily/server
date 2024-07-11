import transport from "../lib/email";
import logger from "../lib/logger";

async function resetPasswordMail(email: string, token: string) {
  try {
    const transporter = await transport();
    await transporter.sendMail({
      from: `${process.env.APPLICATION_NAME} <${process.env.SMTP_EMAIL_FROM}>`,
      to: email,
      subject: "Reset Password",
      html: `<p>Click the link below to reset your password:</p>
             <a href="${process.env.FRONTEND_URL}/reset-password?token=${token}">Reset Password</a>`,
    });
  } catch (error) {
    logger.error(error);
  }
}

async function verificationEmailMail(email: string, token: string) {
  try {
    const transporter = await transport();
    await transporter.sendMail({
      from: `${process.env.APPLICATION_NAME} <${process.env.SMTP_EMAIL_FROM}>`,
      to: email,
      subject: "Email Verification",
      html: `<p>Click the link below to verify your email:</p>
             <a href="${process.env.FRONTEND_URL}/verify-email?token=${token}">Verify Email</a>`,
    });
  } catch (error) {
    logger.error(error);
  }
}

export default {
  resetPassword: resetPasswordMail,
  verificationEmail: verificationEmailMail,
};
