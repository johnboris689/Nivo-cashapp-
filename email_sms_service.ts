import nodemailer from 'nodemailer';
import { getRow } from './db';

interface MailConfig {
  host?: string;
  port?: number;
  secure?: boolean;
  user?: string;
  pass?: string;
  from?: string;
}

// Dynamically fetch configurations from database or environment variables
async function getSettings(): Promise<Record<string, string>> {
  const settings: Record<string, string> = {};
  try {
    const rows = await require('./db').getAllRows(`SELECT key, value FROM admin_settings`);
    for (const r of rows) {
      settings[r.key] = r.value;
    }
  } catch (e) {
    console.error('Error fetching settings from DB:', e);
  }

  // Fallback / override with process.env
  settings.supportEmail = settings.supportEmail || process.env.SUPPORT_EMAIL || 'support@nevo.com';
  settings.supportPhone = settings.supportPhone || process.env.SUPPORT_PHONE || '+2349162845073';
  settings.whatsappNumber = settings.whatsappNumber || process.env.WHATSAPP_NUMBER || '+2349162845073';
  settings.senderName = settings.senderName || process.env.SENDER_NAME || 'Nevo';
  
  return settings;
}

// Generate the fully branded Nevo email HTML template
function getNevoEmailTemplate(title: string, greeting: string, bodyText: string, actionCode: string, supportEmail: string, supportPhone: string, whatsappNumber: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          background-color: #0c0c14;
          margin: 0;
          padding: 0;
          color: #f1f5f9;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #11111e;
          border: 1px solid #1e293b;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
        }
        .header {
          background-color: #0c0c14;
          padding: 30px;
          text-align: center;
          border-bottom: 1px solid #1e293b;
        }
        .logo {
          color: #2dd4bf;
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.05em;
          text-decoration: none;
        }
        .content {
          padding: 40px 30px;
        }
        h1 {
          color: #ffffff;
          font-size: 22px;
          font-weight: 700;
          margin-top: 0;
          margin-bottom: 20px;
        }
        p {
          color: #94a3b8;
          font-size: 15px;
          line-height: 1.6;
          margin-top: 0;
          margin-bottom: 24px;
        }
        .otp-container {
          background-color: #0c0c14;
          border: 1px solid #2dd4bf50;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          margin: 30px 0;
        }
        .otp-code {
          color: #2dd4bf;
          font-size: 32px;
          font-weight: 800;
          letter-spacing: 0.2em;
          margin: 0;
          font-family: monospace;
        }
        .otp-expiry {
          font-size: 11px;
          color: #64748b;
          margin-top: 8px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .footer {
          background-color: #09090f;
          padding: 30px;
          text-align: center;
          font-size: 12px;
          color: #475569;
          border-top: 1px solid #1e293b;
        }
        .support-links a {
          color: #2dd4bf;
          text-decoration: none;
          margin: 0 10px;
        }
        .support-links a:hover {
          text-decoration: underline;
        }
        .support-info {
          margin-top: 15px;
          line-height: 1.5;
        }
        .copyright {
          margin-top: 20px;
          border-top: 1px solid #1e293b;
          padding-top: 15px;
          font-size: 11px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <span class="logo">⚡ NEVO</span>
        </div>
        
        <!-- Content -->
        <div class="content">
          <h1>${title}</h1>
          <p>Hello ${greeting},</p>
          <p>${bodyText}</p>
          
          <div class="otp-container">
            <div class="otp-code">${actionCode}</div>
            <div class="otp-expiry">Expires in 10 minutes • Do not share this code</div>
          </div>
          
          <p>If you did not make this request, you can safely ignore this email. Your account remains secure.</p>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <div class="support-links">
            <a href="mailto:${supportEmail}">Email Support</a> | 
            <a href="tel:${supportPhone}">Call Us</a> | 
            <a href="https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}">WhatsApp</a>
          </div>
          <div class="support-info">
            Need urgent help? Reach out to Nevo Support 24/7.<br>
            Email: ${supportEmail} | Tel: ${supportPhone}
          </div>
          <div class="copyright">
            This email was sent by Nevo.<br>
            Nevo Secured Vault © 2026. All rights reserved.
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Send Email (Simulated / In-App Logger)
export async function sendEmail(to: string, subject: string, title: string, greeting: string, bodyText: string, otp: string): Promise<boolean> {
  const settings = await getSettings();

  console.log(`[NEVO EMAIL DISPATCH] To: ${to} | Subject: "${subject}" | OTP: ${otp}`);
  console.log(`[NEVO EMAIL BODY] ${title} - Hello ${greeting}, ${bodyText}`);

  return true;
}

// Send SMS (Simulated / In-App Logger)
export async function sendSms(phoneNumber: string, message: string): Promise<boolean> {
  const finalMessage = `Nevo: ${message}`;
  console.log(`[NEVO SMS DISPATCH] To: ${phoneNumber} | Message: "${finalMessage}"`);

  return true;
}
