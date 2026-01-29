import { sendTrainingAssignmentEmail, TrainingAssignmentEmail } from '../config/mailer';

export class MailService {
  async sendTrainingAssignment(data: TrainingAssignmentEmail): Promise<void> {
    try {
      await sendTrainingAssignmentEmail(data);
    } catch (error) {
      console.error('Error sending training assignment email:', error);
      throw error;
    }
  }
}

export default new MailService();

