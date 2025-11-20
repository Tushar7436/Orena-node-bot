import fs from 'fs';
import { google } from 'googleapis';
import nodemailer from 'nodemailer';

const CREDENTIALS = JSON.parse(fs.readFileSync('./credentials.json'));
const TOKEN = JSON.parse(fs.readFileSync('./token.json'));

const { client_secret, client_id, redirect_uris } = CREDENTIALS.installed;

const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0]
);

oAuth2Client.setCredentials(TOKEN);

export async function sendGmail(to, subject, html) {
  const accessToken = await oAuth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.GMAIL_USER,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });
    
  const mailOptions = {
    from: `Your App <YOUR_GMAIL@gmail.com>`,
    to: to,
    subject: subject,
    html: html,
  };

  return transport.sendMail(mailOptions);
}
