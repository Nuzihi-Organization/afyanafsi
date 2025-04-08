const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendBookingConfirmationEmail = async (userEmail, booking, therapist) => {
  // Format date
  const date = new Date(booking.date);
  const formattedDate = `${date.toLocaleDateString()} at ${booking.startTime} - ${booking.endTime}`;
  
  // Prepare email content
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'Your Therapy Session Booking Confirmation',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #10b981;">Booking Confirmation</h2>
        <p>Dear client,</p>
        <p>Your therapy session has been successfully booked.</p>
        
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">Session Details:</h3>
          <p><strong>Therapist:</strong> ${therapist.name}, ${therapist.title}</p>
          <p><strong>Date & Time:</strong> ${formattedDate}</p>
          <p><strong>Mode:</strong> ${booking.mode}</p>
          <p><strong>Therapy Type:</strong> ${booking.therapyType}</p>
          ${booking.mode === 'video' && booking.meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${booking.meetingLink}">${booking.meetingLink}</a></p>` : ''}
        </div>
        
        <p>Please note that you can reschedule or cancel your appointment up to 24 hours before the scheduled time.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
          <p>If you have any questions, please reply to this email or contact our support team.</p>
          <p>Thank you for choosing our services.</p>
        </div>
      </div>
    `,
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log('Booking confirmation email sent');
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

module.exports = { sendBookingConfirmationEmail };