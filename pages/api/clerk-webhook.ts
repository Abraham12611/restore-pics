import { NextApiRequest, NextApiResponse } from 'next';
import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { prisma } from '../../lib/prismadb';
import { buffer } from 'micro';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get the raw body
    const rawBody = await buffer(req);
    const body = rawBody.toString();

    // Get the headers
    const svix_id = req.headers['svix-id'] as string;
    const svix_timestamp = req.headers['svix-timestamp'] as string;
    const svix_signature = req.headers['svix-signature'] as string;

    console.log('Clerk webhook received:', {
      hasId: !!svix_id,
      hasTimestamp: !!svix_timestamp,
      hasSignature: !!svix_signature,
      bodyPreview: body.substring(0, 100)
    });

    if (!process.env.CLERK_WEBHOOK_SIGNING_SECRET) {
      console.error('CLERK_WEBHOOK_SIGNING_SECRET is not set');
      return res.status(500).json({ message: 'Webhook secret not configured' });
    }

    // Verify the webhook
    const evt = await verifyWebhook(
      body,
      {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      },
      process.env.CLERK_WEBHOOK_SIGNING_SECRET
    );

    // Process the verified webhook event
    const { type, data } = evt;
    console.log('Clerk webhook verified:', { type, data });

    // Handle different Clerk webhook events
    switch (type) {
      case 'user.created':
        console.log('New user created:', data);
        break;
      case 'user.updated':
        console.log('User updated:', data);
        break;
      // Add other Clerk webhook event handlers as needed
    }

    return res.status(200).json({ message: 'Success' });
  } catch (err) {
    console.error('Clerk webhook verification failed:', err);
    return res.status(400).json({ message: 'Webhook verification failed', error: String(err) });
  }
}