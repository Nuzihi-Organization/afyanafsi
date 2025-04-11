// mailingService.js - A separate service for handling email functionality

const nodemailer = require('nodemailer');

/**
 * Email Service for sending application emails
 */
class MailingService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.hostinger.com',
      port: process.env.SMTP_PORT || 2525,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
  }

  /**
   * Send a password reset email
   * @param {Object} options - Email options
   * @param {string} options.email - Recipient email
   * @param {string} options.resetUrl - Password reset URL
   * @param {string} options.name - User's name (optional)
   * @returns {Promise} - Email sending result
   */
  async sendPasswordResetEmail(options) {
    const greeting = options.name ? `Hello ${options.name},` : 'Hello,';
    
    const message = `
      ${greeting}
      
      You recently requested to reset your password for your Afya Nafsi account. 
      Please click the link below to reset your password:
      
      ${options.resetUrl}
      
      This link is valid for the next 30 minutes. After that, you'll need to request a new password reset link.
      
      If you didn't request this, please ignore this email or contact support if you have concerns.
      
      Thank you,
      The Afya Nafsi Team
    `;
    
    return this.sendEmail({
      to: options.email,
      subject: 'Reset Your Password - Afya Nafsi',
      text: message
    });
  }

  /**
   * Send password change confirmation email
   * @param {Object} options - Email options
   * @param {string} options.email - Recipient email
   * @param {string} options.name - User's name (optional)
   * @returns {Promise} - Email sending result
   */
  async sendPasswordChangeConfirmation(options) {
    const greeting = options.name ? `Hello ${options.name},` : 'Hello,';
    
    const message = `
      ${greeting}
      
      Your password was successfully changed. 
      
      If you did not make this change, please contact our support team immediately.
      
      Thank you,
      The Afya Nafsi Team
    `;
    
    return this.sendEmail({
      to: options.email,
      subject: 'Password Changed Successfully - Afya Nafsi',
      text: message
    });
  }

  /**
   * Send a generic email
   * @param {Object} options - Email options
   * @param {string} options.to - Recipient email address
   * @param {string} options.subject - Email subject
   * @param {string} options.text - Email body text
   * @param {string} options.html - Email body HTML (optional)
   * @returns {Promise} - Email sending result
   */
  async sendEmail(options) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@afyanafsi.com',
        to: options.to,
        subject: options.subject,
        text: options.text
      };
      
      // Add HTML content if provided
      if (options.html) {
        mailOptions.html = options.html;
      }
      
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent: ', info.messageId);
      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      console.error('Email sending failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new MailingService();