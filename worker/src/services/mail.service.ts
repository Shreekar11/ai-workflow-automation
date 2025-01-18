import { config } from "dotenv";
import nodemailer from "nodemailer";

config();

export class EmailService {
  private to: string;
  private from: string;
  private subject: string;
  private body: string;

  constructor(to: string, from: string, subject: string, body: string) {
    this.to = to;
    this.from = from;
    this.subject = subject;
    this.body = body;
  }

  public async sendEmailFunction(): Promise<boolean> {
    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      const mailOptions = {
        to: this.to,
        from: `Workflow Automation <${this.from}>`,
        subject: this.subject,
        text: this.body,
        html: this.body,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent successfully:", info.messageId);
      return true;
    } catch (error) {
      console.error("Error sending email:", error);
      return false;
    }
  }
}
