import * as nodemailer from 'nodemailer';
import { appSettings } from 'src/_core/config/appsettings';

export type MailerNodeType = {
  mail_to: string;
  mail_subject: string;
  mail_html: string;
  mail_bcc?: string;
  mail_cc?: string;
};

const transporter = nodemailer.createTransport(appSettings.email);

export async function executeSendEmail(payload: MailerNodeType): Promise<any> {
  const mailOptions = {
    from: appSettings.email.user,
    to: payload.mail_to,
    subject: payload.mail_subject,
    html: payload.mail_html,
    bcc: payload.mail_bcc,
    cc: payload.mail_cc,
  };
  return await transporter.sendMail(mailOptions);
}
