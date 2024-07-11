import nodemailer, {type TransportOptions} from "nodemailer";

export default async function () {
  return nodemailer.createTransport({
    auth: {pass: process.env.SMTP_PASSWORD, user: process.env.SMTP_USERNAME},
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
  } as TransportOptions);
}
