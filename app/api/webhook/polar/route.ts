import { Webhooks } from "@polar-sh/nextjs";
import { prisma } from '../../../../lib/prismadb';

const CREDITS_PER_PLAN: Record<string, number> = {
  '82a23153-fc8c-45c1-b4c5-040c0ce514c4': 150, // Pro Plan
  '6e735edb-d9d5-4aec-857a-2809da262482': 75,  // Popular Plan
  '8bc44acb-5794-47e9-bedc-f7518f73b732': 35,  // Basic Plan - replace with actual ID
};

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
  onPayload: async (payload) => {
    console.log('Processing webhook payload:', payload);

    // Handle order.paid event which confirms the payment is successful
    if (payload.type === 'order.paid') {
      const { customer, productId } = payload.data;

      if (!customer?.externalId) {
        console.error('No customer external ID found in webhook payload');
        throw new Error('No customer external ID found');
      }

      if (!CREDITS_PER_PLAN[productId]) {
        console.error('Unknown product ID:', productId);
        throw new Error('Unknown product ID');
      }

      try {
        const updatedUser = await prisma.user.update({
          where: { email: customer.externalId },
          data: {
            credits: {
              increment: CREDITS_PER_PLAN[productId],
            },
          },
        });

        console.log('Credits updated successfully:', {
          email: customer.externalId,
          productId,
          creditsAdded: CREDITS_PER_PLAN[productId],
          newCreditBalance: updatedUser.credits
        });
      } catch (error) {
        console.error('Failed to update user credits:', error);
        throw error;
      }
    }
  }
});