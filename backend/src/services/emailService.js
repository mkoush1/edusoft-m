import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Mock email service for development
const mockEmailService = {
  async sendMail(options) {
    console.log('Mock email service - would send email:', {
      to: options.to,
      subject: options.subject,
      html: options.html
    });
    
    // Extract reset link from HTML
    const resetLinkMatch = options.html.match(/href="([^"]+)"/);
    if (resetLinkMatch) {
      console.log('Password reset link:', resetLinkMatch[1]);
    }
    
    return {
      messageId: 'mock-message-id',
      previewUrl: 'https://example.com/mock-email-preview'
    };
  }
};

// Create transporter based on environment
const createTransporter = () => {
  console.log('Creating email transporter...');
  console.log('Email configuration:', {
    hasUser: !!process.env.EMAIL_USER,
    hasPassword: !!process.env.EMAIL_PASSWORD,
    hasFrontendUrl: !!process.env.FRONTEND_URL,
    nodeEnv: process.env.NODE_ENV
  });

  // Always use mock service in development or if no credentials
  if (process.env.NODE_ENV === 'development' || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn('Using mock email service');
    return mockEmailService;
  }

  // Production email configuration
  console.log('Using Gmail configuration');
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Send email function
export const sendEmail = async (to, subject, html) => {
  try {
    console.log('Preparing to send email:', { to, subject });
    
    if (!process.env.FRONTEND_URL) {
      console.error('FRONTEND_URL is not set in environment variables');
      throw new Error('Frontend URL is not configured');
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'test@example.com',
      to,
      subject,
      html,
    };

    console.log('Sending email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    
    // Always return a consistent response in development mode
    if (process.env.NODE_ENV === 'development') {
      return {
        success: true,
        message: 'Mock email sent successfully',
        messageId: 'mock-message-id',
        previewUrl: 'https://example.com/mock-email-preview'
      };
    }

    return { 
      success: true, 
      message: 'Email sent successfully',
      messageId: info.messageId,
      previewUrl: info.previewUrl
    };
  } catch (error) {
    console.error('Email sending error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      to,
      subject
    });
    
    // In development mode, return mock response even on error
    if (process.env.NODE_ENV === 'development') {
      console.warn('Development mode: Returning mock response despite error');
      return {
        success: true,
        message: 'Mock email sent successfully',
        messageId: 'mock-message-id',
        previewUrl: 'https://example.com/mock-email-preview'
      };
    }
    
    throw new Error('Failed to send email: ' + error.message);
  }
};

export const sendConfirmationEmail = async (email, verificationUrl) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Confirm your EduSoft account',
    html: `
      <h1>Welcome to EduSoft!</h1>
      <p>Thank you for signing up! Please confirm your email address by clicking the link below:</p>
      <p><a href="${verificationUrl}" style="background:#592538;color:#fff;padding:10px 20px;text-decoration:none;border-radius:5px;">Verify Email</a></p>
      <p>If the button above does not work, copy and paste this link into your browser:</p>
      <p><a href="${verificationUrl}">${verificationUrl}</a></p>
      <p>This link will expire in 24 hours.</p>
      <hr />
      <p>If you did not create an account, you can safely ignore this email.</p>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Confirmation email sent:', info);
    return info;
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    throw error;
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email, resetToken, userType) => {
  try {
    if (!process.env.FRONTEND_URL) {
      throw new Error('FRONTEND_URL is not configured');
    }

    // Create reset URL with encoded token
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(resetToken)}&type=${userType}`;
    
    // Log the reset URL in a very visible way
    console.log('\n\n');
    console.log('==================================================');
    console.log('🚀 PASSWORD RESET LINK (COPY THIS URL):');
    console.log('==================================================');
    console.log(resetUrl);
    console.log('==================================================');
    console.log('📧 Email:', email);
    console.log('👤 User Type:', userType);
    console.log('==================================================\n\n');

    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'test@example.com',
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h1>Password Reset Request</h1>
        <p>You have requested to reset your password. Click the link below to proceed:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request this reset, please ignore this email.</p>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully:', info.messageId);
    
    // In development mode, include the reset URL in the response
    if (process.env.NODE_ENV === 'development') {
      return { ...info, resetUrl };
    }
    
    return info;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email. Please try again later.');
  }
}; 