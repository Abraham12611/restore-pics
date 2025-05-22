import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { createClerkClient } from '@clerk/nextjs/server';
import { prisma } from '../../lib/prismadb';

type Data = {
  credits: number;
} | string;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // Check if user is logged in
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json('Login to upload.');
  }

  try {
    // Create a Clerk client instance
    const clerk = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY
    });

    // Add check for clerk object
    if (!clerk) {
      console.error('Clerk client failed to initialize.');
      return res.status(500).json('Internal server error: Clerk client initialization failed.');
    }

    // Get user's primary email address
    const user = await clerk.users.getUser(userId);
    const primaryEmail = user.emailAddresses.find((email: { id: string; emailAddress: string }) =>
      email.id === user.primaryEmailAddressId)?.emailAddress;

    if (!primaryEmail) {
      return res.status(500).json('Could not find user email.');
    }

    // Get user's credits from database
    const dbUser = await prisma.user.findUnique({
      where: { email: primaryEmail },
      select: { credits: true },
    });

    return res.status(200).json({
      credits: dbUser?.credits ?? 0
    });
  } catch (error) {
    console.error('Error in handler:', error);
    if (error.clerkError && error.errors) {
      console.error('Clerk error details:', {
        errors: error.errors,
        status: error.status,
        clerkTraceId: error.clerkTraceId,
        retryAfter: error.retryAfter
      });
    }
    return res.status(500).json('Internal server error.');
  }
}
