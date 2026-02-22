import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { buffer } from 'micro';
import { Resend } from 'resend';

export const config = {
  api: { bodyParser: false },
};

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

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_TESTGEN_WEBHOOK_SECRET || !process.env.RESEND_API_KEY) {
    console.error('Missing required environment variables');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  try {
    const rawBody = await buffer(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_TESTGEN_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    const customerEmail = escapeHtml(session.customer_details?.email || 'Unknown');
    const rawName = session.customer_details?.name || 'Unknown';
    const customerName = escapeHtml(rawName);
    const amountTotal = session.amount_total ? `$${(session.amount_total / 100).toFixed(2)}` : 'Unknown';
    const mode = session.mode === 'subscription' ? 'Subscription' : 'One-time';

    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
      await resend.emails.send({
        from: 'TestGen AI <contact@manoga.digital>',
        to: 'hi@manoga.digital',
        subject: `New TestGen AI Sale: ${amountTotal} from ${rawName}`,
        html: `
          <h2>New TestGen AI Purchase</h2>
          <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
            <tr><td style="padding: 8px; font-weight: bold;">Customer</td><td style="padding: 8px;">${customerName}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Email</td><td style="padding: 8px;">${customerEmail}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Amount</td><td style="padding: 8px;">${amountTotal}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Type</td><td style="padding: 8px;">${mode}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Session ID</td><td style="padding: 8px;">${session.id}</td></tr>
          </table>
          <p style="margin-top: 16px; color: #666;">Customer will submit repo details via the form next.</p>
        `,
      });
    } catch (emailErr) {
      console.error('Failed to send sale notification:', emailErr);
    }
  }

  return res.status(200).json({ received: true });
}
