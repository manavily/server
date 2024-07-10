import nodemailer, { type TransportOptions } from "nodemailer";

export default async function () {
  return nodemailer.createTransport({
    auth: { pass: process.env.MAIL_PASSWORD, user: process.env.MAIL_USERNAME },
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
  } as TransportOptions);
}
