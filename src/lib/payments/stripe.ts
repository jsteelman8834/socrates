import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
});

// Subscription plan IDs (configure these in Stripe Dashboard)
export const SUBSCRIPTION_PLANS = {
  FREE: {
    id: 'free',
    name: 'Free',
    price: 0,
    features: [
      '3 sessions per week',
      '1 child account',
      'Basic progress tracking',
    ],
    limits: {
      sessionsPerWeek: 3,
      childAccounts: 1,
    },
  },
  FAMILY: {
    id: process.env.STRIPE_FAMILY_PRICE_ID || 'price_family',
    name: 'Family',
    price: 9.99,
    features: [
      'Unlimited sessions',
      'Up to 4 child accounts',
      'Detailed progress reports',
      'AI-powered insights',
      'Email summaries',
    ],
    limits: {
      sessionsPerWeek: -1, // Unlimited
      childAccounts: 4,
    },
  },
  CLASSROOM: {
    id: process.env.STRIPE_CLASSROOM_PRICE_ID || 'price_classroom',
    name: 'Classroom',
    price: 29.99,
    features: [
      'Everything in Family',
      'Up to 30 student accounts',
      'Teacher dashboard',
      'Class-wide analytics',
      'Custom topic assignments',
    ],
    limits: {
      sessionsPerWeek: -1,
      childAccounts: 30,
    },
  },
} as const;

export type PlanId = keyof typeof SUBSCRIPTION_PLANS;

/**
 * Create a Stripe Checkout session for subscription
 */
export async function createCheckoutSession({
  userId,
  priceId,
  successUrl,
  cancelUrl,
}: {
  userId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<Stripe.Checkout.Session> {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: userId,
    metadata: {
      userId,
    },
    subscription_data: {
      metadata: {
        userId,
      },
    },
  });

  return session;
}

/**
 * Create a Stripe Customer Portal session
 */
export async function createPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}): Promise<Stripe.BillingPortal.Session> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

/**
 * Get subscription by ID
 */
export async function getSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription | null> {
  try {
    return await stripe.subscriptions.retrieve(subscriptionId);
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }
}

/**
 * Cancel subscription at period end
 */
export async function cancelSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

/**
 * Reactivate a cancelled subscription
 */
export async function reactivateSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
}
