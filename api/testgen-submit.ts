import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
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

  const { repoUrl, framework, email, notes, sessionId, website, _t } = req.body;

  // Honeypot check
  if (website) {
    return res.status(200).json({ success: true });
  }

  // Timestamp check — form submitted too fast means bot (< 3 seconds)
  const loadTime = parseInt(_t, 10);
  if (!loadTime || Date.now() - loadTime < 3000) {
    return res.status(200).json({ success: true });
  }

  if (!repoUrl || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Server-side GitHub URL validation
  if (!String(repoUrl).startsWith('https://github.com/')) {
    return res.status(400).json({ error: 'Repository URL must be a GitHub URL' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  // Input length limits
  if (framework && String(framework).length > 200) {
    return res.status(400).json({ error: 'Framework field too long' });
  }
  if (notes && String(notes).length > 5000) {
    return res.status(400).json({ error: 'Notes field too long' });
  }

  // Verify payment via Stripe session
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY is not set');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  if (!sessionId) {
    return res.status(403).json({ error: 'Payment session required' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  try {
    const session = await stripe.checkout.sessions.retrieve(String(sessionId));
    if (!session || session.payment_status !== 'paid') {
      return res.status(403).json({ error: 'Payment not verified' });
    }
  } catch {
    return res.status(403).json({ error: 'Invalid payment session' });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const safeRepoUrl = escapeHtml(String(repoUrl));
  const safeFramework = escapeHtml(String(framework || ''));
  const safeEmail = escapeHtml(String(email));
  const safeNotes = escapeHtml(String(notes || ''));
  const safeSessionId = escapeHtml(String(sessionId || ''));

  try {
    await resend.emails.send({
      from: 'TestGen AI <contact@manoga.digital>',
      to: 'hi@manoga.digital',
      replyTo: email,
      subject: `TestGen AI Submission: ${String(repoUrl)}`,
      html: `
        <h2>New TestGen AI Project Submission</h2>
        <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
          <tr><td style="padding: 8px; font-weight: bold;">Repository</td><td style="padding: 8px;"><a href="${String(repoUrl)}">${safeRepoUrl}</a></td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Framework</td><td style="padding: 8px;">${safeFramework || 'Not specified'}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Email</td><td style="padding: 8px;">${safeEmail}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Stripe Session</td><td style="padding: 8px;">${safeSessionId || 'Not provided'}</td></tr>
        </table>
        <hr style="margin: 16px 0;" />
        <p><strong>Notes:</strong></p>
        <p style="white-space: pre-wrap;">${safeNotes || 'None'}</p>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Email send error:', error);
    return res.status(500).json({ error: 'Failed to send submission' });
  }
}
