import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { createClerkClient } from '@clerk/nextjs/server';
import { prisma } from '../../lib/prismadb';
import Replicate from 'replicate';

type Data = string;
interface ExtendedNextApiRequest extends NextApiRequest {
  body: {
    imageUrl: string;
  };
}

export default async function handler(
  req: ExtendedNextApiRequest,
  res: NextApiResponse<Data>
) {
  // Check if user is logged in
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json('Login to upload.');
  }

  // Create a Clerk client instance
  const clerk = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY
  });

  // Get user's primary email address
  const user = await clerk.users.getUser(userId);
  const primaryEmail = user.emailAddresses.find((email: { id: string; emailAddress: string }) =>
    email.id === user.primaryEmailAddressId)?.emailAddress;

  if (!primaryEmail) {
    return res.status(500).json('Could not find user email.');
  }

  // Check if user has credits
  const dbUser = await prisma.user.findUnique({
    where: { email: primaryEmail },
    select: { credits: true },
  });

  if (!dbUser || dbUser.credits <= 0) {
    return res.status(402).json('No credits remaining. Please purchase credits to continue.');
  }

  const inputImageUrl = req.body.imageUrl;

  // Initialize Replicate client
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_KEY!,
  });

  try {
    // Run the model with retry logic for 503 errors
    let retries = 3;
    let lastError;

    while (retries > 0) {
      try {
        const prediction = await replicate.predictions.create({
          version: "dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e",
          input: {
            image: inputImageUrl,
            scale_factor: 2,
            prompt: "masterpiece, best quality, highres, <lora:more_details:0.5> <lora:SDXLrender_v2.0:1>",
            negative_prompt: "(worst quality, low quality, normal quality:2) JuggernautNegative-neg",
            dynamic: 6,
            creativity: 0.35,
            resemblance: 0.6
          }
        });

        console.log('Raw Replicate API prediction:', prediction);

        // Wait for the prediction to complete
        let restoredImageUrl;
        while (prediction.status !== "succeeded" && prediction.status !== "failed") {
          await new Promise(resolve => setTimeout(resolve, 1000));
          const updatedPrediction = await replicate.predictions.get(prediction.id);
          console.log('Prediction status:', updatedPrediction.status);

          if (updatedPrediction.status === "succeeded" && updatedPrediction.output && Array.isArray(updatedPrediction.output)) {
            restoredImageUrl = updatedPrediction.output[0];
            break;
          } else if (updatedPrediction.status === "failed") {
            throw new Error('Prediction failed: ' + (updatedPrediction.error || 'Unknown error'));
          }
        }

        if (!restoredImageUrl || typeof restoredImageUrl !== 'string') {
          throw new Error('Invalid image URL received from API');
        }

        console.log('Final image URL:', restoredImageUrl);

        // Deduct one credit after successful generation
        console.log('Attempting to deduct credit for user:', primaryEmail);
        await prisma.user.update({
          where: { email: primaryEmail },
          data: {
            credits: {
              decrement: 1,
            },
          },
        });
        console.log('Credit deducted successfully.');

        // Return the image URL
        return res.status(200).json(restoredImageUrl);
      } catch (error: any) {
        lastError = error;
        if (error.status === 503 && retries > 1) {
          console.log(`Replicate API returned 503, retrying... (${retries - 1} attempts remaining)`);
          retries--;
          // Wait for 2 seconds before retrying
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
        throw error;
      }
    }

    // If we've exhausted all retries, throw the last error
    throw lastError;
  } catch (error: any) {
    console.error('Error restoring image:', error);

    // Handle specific error cases
    if (error.status === 503) {
      return res.status(503).json('The image restoration service is temporarily unavailable. Please try again in a few minutes.');
    } else if (error.status === 401) {
      return res.status(401).json('Invalid API key. Please check your Replicate API configuration.');
    } else if (error.status === 429) {
      return res.status(429).json('Rate limit exceeded. Please try again later.');
    }

    // Return the actual error message from the backend
    return res.status(500).json(error.message || 'An unknown error occurred while restoring the image.');
  }
}
