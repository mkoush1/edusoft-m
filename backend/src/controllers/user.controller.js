import User from '../models/User.js';
import { sendEmail } from '../services/emailService.js';

export const sendStudentReport = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reportText } = req.body;
    if (!reportText) {
      return res.status(400).json({ success: false, message: 'Report text is required.' });
    }
    const student = await User.findOne({ userId: Number(userId), role: 'student' });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }
    const html = `
      <div style="font-family: Arial, sans-serif; background: #f7f4f3; padding: 32px;">
        <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px #0001; padding: 32px;">
          <h1 style="color: #592538; margin-bottom: 16px;">EduSoft Admin Report</h1>
          <p style="font-size: 16px; color: #333; margin-bottom: 24px;">
            Dear <b>${student.name}</b>,<br><br>
            You have received a new report from your admin. Please see the details below:
          </p>
          <div style="background: #f3f3f3; border-left: 4px solid #592538; padding: 16px; margin-bottom: 24px;">
            <p style="font-size: 16px; color: #222; margin: 0; white-space: pre-line;">${reportText}</p>
          </div>
          <p style="font-size: 14px; color: #666;">If you have any questions, please contact your admin or reply to this email.</p>
          <hr style="margin: 32px 0;">
          <p style="font-size: 12px; color: #aaa;">This is an automated message from EduSoft. Please do not reply directly to this email.</p>
        </div>
      </div>
    `;
    await sendEmail(
      student.email,
      'You have received a report from your admin',
      html
    );
    res.json({ success: true, message: 'Report sent to student email.' });
  } catch (error) {
    console.error('Error sending student report:', error);
    res.status(500).json({ success: false, message: 'Failed to send report.', error: error.message });
  }
}; 