import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const PRICE_MAP: Record<string, string | undefined> = {
  onetime: process.env.STRIPE_TESTGEN_ONETIME_PRICE_ID,
  starter: process.env.STRIPE_TESTGEN_STARTER_PRICE_ID,
  pro: process.env.STRIPE_TESTGEN_PRO_PRICE_ID,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tier } = req.body;

  if (!tier || !PRICE_MAP[tier]) {
    return res.status(400).json({ error: 'Invalid tier' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY is not set');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const priceId = PRICE_MAP[tier];
  if (!priceId) {
    console.error(`Price ID not configured for tier: ${tier}`);
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const isSubscription = tier !== 'onetime';
  const baseUrl = process.env.SITE_URL || 'https://www.manoga.digital';

  try {
    const session = await stripe.checkout.sessions.create({
      mode: isSubscription ? 'subscription' : 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/testgen/submit?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/testgen`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
}
