import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, service, message, website, _t } = req.body;

  // Honeypot check — bots fill this hidden field, humans don't see it
  if (website) {
    return res.status(200).json({ success: true });
  }

  // Timestamp check — form submitted too fast means bot (< 3 seconds)
  const loadTime = parseInt(_t, 10);
  if (!loadTime || Date.now() - loadTime < 3000) {
    return res.status(200).json({ success: true });
  }

  // Validate required fields
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY environment variable is not set');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const safeName = escapeHtml(String(name));
  const safeEmail = escapeHtml(String(email));
  const safePhone = escapeHtml(String(phone || ''));
  const safeService = escapeHtml(String(service || ''));
  const safeMessage = escapeHtml(String(message));

  try {
    await resend.emails.send({
      from: 'Manoga Contact <contact@manoga.digital>',
      to: 'hi@manoga.digital',
      replyTo: email,
      subject: `New inquiry from ${safeName}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
          <tr><td style="padding: 8px; font-weight: bold;">Name</td><td style="padding: 8px;">${safeName}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Email</td><td style="padding: 8px;">${safeEmail}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Phone</td><td style="padding: 8px;">${safePhone || 'Not provided'}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Service</td><td style="padding: 8px;">${safeService || 'Not selected'}</td></tr>
        </table>
        <hr style="margin: 16px 0;" />
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap;">${safeMessage}</p>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Email send error:', error);
    return res.status(500).json({ error: 'Failed to send message' });
  }
}
