import nodemailer from "nodemailer";
import AppError from "../utils/AppError";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private transporter;

  constructor() {
    // Create reusable transporter object using environment credentials
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendEmail(options: SendEmailOptions): Promise<void> {
    try {
      if (!options.to) {
        throw AppError.badRequest("Recipient email address is required");
      }

      const mailOptions = {
        from: `CU Pyay <${process.env.EMAIL_USERNAME}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text, // Optional plain text fallback
      };

      const info = await this.transporter.sendMail(mailOptions);

      if (!info.messageId) {
        throw AppError.internal("Failed to send email");
      }

      console.log(`✅ Email sent to ${options.to}: ${info.messageId}`);
    } catch (error) {
      console.error("❌ Error sending email:", error);
      // Rethrow standardized error for controller-level handling
      throw AppError.internal("Email sending failed");
    }
  }
}

export default EmailService;
