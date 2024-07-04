import { google } from 'googleapis';
import nodemailer from 'nodemailer';

const { OAuth2 } = google.auth;

const oauth2Client = new OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, 'https://developers.google.com/oauthplayground');
oauth2Client.setCredentials({refresh_token: process.env.REFRESH_TOKEN});

export async function sendResetPasswordEmail(email: string, token: string) {
  try {
    const accessToken = await oauth2Client.getAccessToken();
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: accessToken.token || '',
      },
    });
    await transporter.sendMail({
      from: `${process.env.APPLICATION_NAME} <${process.env.EMAIL}>`,
      to: email,
      subject: 'Password Reset',
      html: `<p>Click the link below to reset your password:</p>
             <a href="${process.env.FRONTEND_URL}/reset-password?token=${token}">Reset Password</a>`,
    });
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export async function sendVerificationEmail(email: string, token: string) {
  try {
    const accessToken = await oauth2Client.getAccessToken();
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: accessToken.token || '',
      },
    });
    await transporter.sendMail({
      from: `${process.env.APPLICATION_NAME} <${process.env.EMAIL}>`,
      to: email,
      subject: 'Email Verification',
      html: `<p>Click the link below to verify your email:</p>
             <a href="${process.env.FRONTEND_URL}/verify-email?token=${token}">Verify Email</a>`,
    });
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
