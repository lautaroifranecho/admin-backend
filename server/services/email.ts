import nodemailer from 'nodemailer';
import type { User } from '@shared/schema';
import { templateAHtml, templateBHtml, templateCHtml, templateAText, templateBText, templateCText } from "./emailTemplates";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const FROM_EMAIL = process.env.FROM_EMAIL || process.env.MAIL_FROM || 'noreply@company.com';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@company.com';
const COMPANY_NAME = process.env.COMPANY_NAME || 'Norris Legal Family Office, LLC';

export async function sendVerificationEmail(user: User): Promise<void> {
  try {
    console.log('Attempting to send verification email to:', user.email);
    const verificationUrl = `${BASE_URL}/verify/${user.verification_token}`;
    console.log("verificationUrl", verificationUrl);
    
    let htmlContent = "";
    let textContent = "";
    let subject = "";
    if (user.group_template === "DismissingClients") {
      htmlContent = templateAHtml(user.first_name, verificationUrl, ADMIN_EMAIL, COMPANY_NAME, user.address);
      textContent = templateAText(user.first_name, verificationUrl, ADMIN_EMAIL, COMPANY_NAME, user.address);
      subject = "Confirm your Address – Returning Your Original Estate Documents";
    } else if (user.group_template === "BigClients") {
      htmlContent = templateBHtml(user.first_name, verificationUrl, ADMIN_EMAIL, COMPANY_NAME, user.address);
      textContent = templateBText(user.first_name, verificationUrl, ADMIN_EMAIL, COMPANY_NAME, user.address);
      subject = "";
    } else if (user.group_template === "GeneralClients") {
      htmlContent = templateCHtml(user.first_name, verificationUrl, ADMIN_EMAIL, COMPANY_NAME, user.address);
      textContent = templateCText(user.first_name, verificationUrl, ADMIN_EMAIL, COMPANY_NAME, user.address);
      subject = "";
    }

    const mailOptions = {
      from: FROM_EMAIL,
      to: user.email,
      subject: subject,
      html: htmlContent,
      text: textContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully to:', user.email, 'Message ID:', info.messageId);
  } catch (error) {
    console.error('Failed to send verification email to:', user.email, 'Error:', error);
  }
}

export async function sendAdminAlert(user: User, changes: any): Promise<void> {
  const fullName = `${user.first_name} ${user.last_name}`.trim();
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Information Updated</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          margin: 0; 
          padding: 20px; 
          background-color: #f3f4f6; 
          line-height: 1.6;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background-color: white; 
          border-radius: 12px; 
          overflow: hidden; 
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .header { 
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          padding: 24px; 
          color: white; 
          text-align: center;
        }
        .header h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
        }
        .content { 
          padding: 24px; 
        }
        .info-section {
          background-color: #f9fafb;
          padding: 16px;
          border-radius: 8px;
          margin: 16px 0;
          border-left: 4px solid #1976D2;
        }
        .info-section h3 {
          margin: 0 0 8px 0;
          color: #1f2937;
          font-size: 16px;
        }
        .info-section p {
          margin: 4px 0;
          color: #4b5563;
        }
        .changes { 
          background-color: #fef3c7; 
          padding: 16px; 
          border-radius: 8px; 
          margin: 16px 0; 
          border-left: 4px solid #f59e0b;
        }
        .changes h3 {
          color: #92400e;
          margin: 0 0 12px 0;
        }
        .change-item {
          margin: 8px 0;
          padding: 8px;
          background-color: white;
          border-radius: 4px;
          font-size: 14px;
        }
        .old-value {
          color: #dc2626;
          text-decoration: line-through;
        }
        .new-value {
          color: #059669;
          font-weight: 600;
        }
        .cta-button {
          display: inline-block;
          background-color: #1976D2;
          color: white !important;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin: 16px 0;
        }
        .timestamp {
          color: #6b7280;
          font-size: 12px;
          text-align: center;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Address Information Updated</h1>
        </div>
        <div class="content">
          <div class="user-info">
            <h3>User Details:</h3>
            <p><strong>Name:</strong> ${fullName}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Updated:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <div class="changes">
            <h3>Changes Made:</h3>
            ${Object.keys(changes.newData).map(key => {
              const oldValue = changes.oldData[key];
              const newValue = changes.newData[key];
              if (oldValue !== newValue) {
                return `
                  <div class="change-item">
                    <strong>${key.charAt(0).toUpperCase() + key.slice(1)}:</strong><br>
                    <span class="old-value">${oldValue || 'N/A'}</span><br>
                    <span class="new-value">${newValue || 'N/A'}</span>
                  </div>
                `;
              }
              return '';
            }).join('')}
          </div>
          
          <p>Please review these changes in the admin dashboard.</p>
          
          <a href="${BASE_URL}/dashboard" class="cta-button">View in Dashboard</a>
        </div>
        
        <div class="timestamp">
          Alert generated at ${new Date().toISOString()}
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
    Alert for User Update
    
    User: ${fullName}
    Email: ${user.email}
    Updated: ${new Date().toLocaleString()}
    
    Changes Made:
    ${Object.keys(changes.newData).map(key => {
      const oldValue = changes.oldData[key];
      const newValue = changes.newData[key];
      if (oldValue !== newValue) {
        return `${key}: "${oldValue}" → "${newValue}"`;
      }
      return '';
    }).filter(Boolean).join('\n')}
    
    Please review these changes in the admin dashboard: ${BASE_URL}/dashboard
    
    Alert generated at ${new Date().toISOString()}
  `;

  const mailOptions = {
    from: `"${COMPANY_NAME} Alert System" <${FROM_EMAIL}>`,
    to: ADMIN_EMAIL,
    subject: `🚨 Address Update Alert - ${fullName}`,
    text: textContent,
    html: htmlContent,
    headers: {
      'X-Priority': '1',
      'X-MSMail-Priority': 'High',
      'Importance': 'high'
    }
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Admin alert sent successfully for user ${user.email}`);
  } catch (error) {
    console.error(`Failed to send admin alert for user ${user.email}:`, error);
    throw new Error('Failed to send admin alert');
  }
}

export async function testEmailConfiguration(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log('Email configuration is valid');
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
}
