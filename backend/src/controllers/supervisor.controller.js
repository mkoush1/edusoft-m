import mongoose from "mongoose";
import Supervisor from '../models/supervisor.model.js';
import User from '../models/User.js';
import { sendEmail } from '../services/emailService.js';

// Supervisor management
export const createSupervisor = async (req, res) => {
  try {
    const { Email, Password, Username } = req.body;
    if (!Email || !Password || !Username) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        details: {
          Email: !Email ? 'Email is required' : undefined,
          Password: !Password ? 'Password is required' : undefined,
          Username: !Username ? 'Username is required' : undefined
        }
      });
    }
    const existingSupervisor = await Supervisor.findOne({ Email: Email.toLowerCase() });
    if (existingSupervisor) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
        details: 'An account with this email already exists'
      });
    }
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    if (!strongPasswordRegex.test(Password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character',
        field: 'Password'
      });
    }
    const newSupervisor = new Supervisor({
      Username: Username.trim(),
      Email: Email.toLowerCase().trim(),
      Password: Password
    });
    const validationError = newSupervisor.validateSync();
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(validationError.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }
    await newSupervisor.save();
    res.status(201).json({ success: true, data: newSupervisor });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getSupervisors = async (req, res) => {
  try {
    const supervisors = await Supervisor.find({});
    res.status(200).json({ success: true, data: supervisors });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getSupervisorById = async (req, res) => {
  try {
    const supervisor = await Supervisor.findById(req.params.id);
    if (!supervisor) {
      return res.status(404).json({ success: false, message: "Supervisor not found" });
    }
    res.status(200).json({ success: true, data: supervisor });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const updateSupervisor = async (req, res) => {
  try {
    let supervisor = null;
    // Try by MongoDB _id first
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      supervisor = await Supervisor.findById(req.params.id);
    }
    // If not found, try by supervisorId
    if (!supervisor) {
      supervisor = await Supervisor.findOne({ supervisorId: Number(req.params.id) });
    }
    if (!supervisor) {
      return res.status(404).json({ success: false, message: "Supervisor not found" });
    }
    Object.keys(req.body).forEach((key) => {
      supervisor[key] = req.body[key];
    });
    await supervisor.save();
    res.status(200).json({ success: true, data: supervisor });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteSupervisor = async (req, res) => {
  try {
    const { id } = req.params;
    let deletedSupervisor = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      deletedSupervisor = await Supervisor.findByIdAndDelete(id);
    }
    if (!deletedSupervisor) {
      // Try by supervisorId if not found by _id
      deletedSupervisor = await Supervisor.findOneAndDelete({ supervisorId: Number(id) });
    }
    if (!deletedSupervisor) {
      return res.status(404).json({ success: false, message: "Supervisor not found" });
    }
    res.status(200).json({ success: true, message: "Supervisor deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// User management
export const getAllUsers = async (req, res) => {
  console.log('getAllUsers called');
  try {
    const users = await User.find({ role: 'student' }, '_id name email');
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error('getAllUsers error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users', error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete user', error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    const user = await User.findByIdAndUpdate(id, { name, email }, { new: true });
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update user', error: error.message });
  }
};

// Student management for /api/users/students
export const getAllStudents = async (req, res) => {
  try {
    const students = await User.find(
      { role: 'student' },
      'userId name email softSkillScore progress totalAssessmentsCompleted'
    );
    console.log('Students fetched:', students);
    res.status(200).json({ success: true, users: students });
  } catch (error) {
    console.error('getAllStudents error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch students', error: error.message });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    // Find and delete by userId, not _id
    const result = await User.findOneAndDelete({ userId: Number(id), role: 'student' });
    if (!result) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.status(200).json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete student', error: error.message });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    // Find and update by userId, not _id
    const user = await User.findOneAndUpdate(
      { userId: Number(id), role: 'student' },
      { name, email },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update student', error: error.message });
  }
};

export const sendSupervisorReport = async (req, res) => {
  try {
    const { supervisorId } = req.params;
    const { reportText } = req.body;
    if (!reportText) {
      return res.status(400).json({ success: false, message: 'Report text is required.' });
    }
    const supervisor = await Supervisor.findOne({ supervisorId: Number(supervisorId) });
    if (!supervisor) {
      return res.status(404).json({ success: false, message: 'Supervisor not found.' });
    }
    const html = `
      <div style="font-family: Arial, sans-serif; background: #f7f4f3; padding: 32px;">
        <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px #0001; padding: 32px;">
          <h1 style="color: #592538; margin-bottom: 16px;">EduSoft Admin Report</h1>
          <p style="font-size: 16px; color: #333; margin-bottom: 24px;">
            Dear <b>${supervisor.Username}</b>,<br><br>
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
      supervisor.Email,
      'You have received a report from your admin',
      html
    );
    res.json({ success: true, message: 'Report sent to supervisor email.' });
  } catch (error) {
    console.error('Error sending supervisor report:', error);
    res.status(500).json({ success: false, message: 'Failed to send report.', error: error.message });
  }
}; 