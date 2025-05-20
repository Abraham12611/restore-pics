import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth, clerkClient } from '@clerk/nextjs/server';
import { prisma } from '../../lib/prismadb';
import { Polar } from '@polar-sh/sdk';

const POLAR_PRODUCTS = {
  basic: process.env.POLAR_PRODUCT_ID_BASIC,
  popular: process.env.POLAR_PRODUCT_ID_POPULAR,
  pro: process.env.POLAR_PRODUCT_ID_PRO,
};

// Initialize Polar SDK
const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN ?? '',
  server: process.env.NODE_ENV === 'development' ? 'sandbox' : 'production'
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Initialize the Backend SDK
    const client = await clerkClient();

    // Get the user's full Backend User object
    const user = await client.users.getUser(userId);
    const primaryEmail = user.emailAddresses.find(
      (email: { id: string; emailAddress: string }) =>
      email.id === user.primaryEmailAddressId
    )?.emailAddress;

    if (!primaryEmail) {
      return res.status(500).json({ message: 'Could not find user email.' });
    }

    const { plan } = req.body;
    if (!plan || !POLAR_PRODUCTS[plan as keyof typeof POLAR_PRODUCTS]) {
      return res.status(400).json({ message: 'Invalid plan' });
    }

    // Ensure user exists in our database
    let dbUser = await prisma.user.findUnique({
      where: { email: primaryEmail }
    });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          email: primaryEmail,
          credits: 0
        }
      });
    }

    // Create checkout session using Polar SDK
    const session = await polar.checkouts.create({
      customerExternalId: primaryEmail,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/restore?success=true`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/restore?canceled=true`,
      products: [
        POLAR_PRODUCTS[plan as keyof typeof POLAR_PRODUCTS]!
      ]
    });

    if (!session?.url) {
      throw new Error('Failed to create checkout session');
    }

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    // Ensure we always return a JSON response, even for errors
    return res.status(500).json({
      message: error instanceof Error ? error.message : 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}