import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { createClerkClient } from '@clerk/nextjs/server';
import { prisma } from '../../lib/prismadb';

type Data =
  | { credits: number }
  | { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      // Create a Clerk client instance
      const clerk = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY
      });
      // Get the user's full Backend User object
      const user = await clerk.users.getUser(userId);

      if (!user) {
        console.error('No user found with ID:', userId);
        return res.status(404).json({ error: 'User not found' });
      }

      const primaryEmail = user.emailAddresses.find(
        (email: { id: string; emailAddress: string }) => email.id === user.primaryEmailAddressId
      )?.emailAddress;

      if (!primaryEmail) {
        console.error('No primary email found for user:', userId);
        return res.status(400).json({ error: 'Primary email not found' });
      }

      // Find or create user in the database
      const dbUser = await prisma.user.upsert({
        where: { email: primaryEmail },
        update: {},
        create: {
          email: primaryEmail,
          credits: 0
        }
      });

      return res.status(200).json({ credits: dbUser.credits });
    } catch (clerkError) {
      console.error('Clerk error:', clerkError);
      return res.status(500).json({ error: 'Error fetching user data from Clerk' });
    }
  } catch (error) {
    console.error('Error fetching user credits:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}