import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export interface TrainingAssignmentEmail {
  to: string;
  trainingTopic: string;
  venue: string;
  date: string;
  time: string;
  trainer: string;
}

export const sendTrainingAssignmentEmail = async (
  data: TrainingAssignmentEmail
): Promise<void> => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: data.to,
    subject: `Training Assignment: ${data.trainingTopic}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Training Assignment Notification</h2>
        <p>You have been assigned a training:</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Training Topic:</strong> ${data.trainingTopic}</p>
          <p><strong>Venue:</strong> ${data.venue || 'TBD'}</p>
          <p><strong>Date:</strong> ${data.date || 'TBD'}</p>
          <p><strong>Time:</strong> ${data.time || 'TBD'}</p>
          <p><strong>Trainer/Faculty:</strong> ${data.trainer || 'TBD'}</p>
        </div>
        <div style="margin: 25px 0;">
          <p>Please click the button below to log in to the Training Calendar Management System to view more details and update your training status:</p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://your-training-system.com'}/login?email=${encodeURIComponent(data.to)}" 
               style="background-color: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
              Login to Training Portal
            </a>
          </div>
          <p>Or copy and paste this link into your browser:<br>
          <a href="${process.env.FRONTEND_URL || 'https://your-training-system.com'}/login?email=${encodeURIComponent(data.to)}">
            ${process.env.FRONTEND_URL || 'https://your-training-system.com'}/login?email=${encodeURIComponent(data.to)}
          </a></p>
        </div>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          This is an automated email. Please do not reply.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Training assignment email sent to ${data.to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

