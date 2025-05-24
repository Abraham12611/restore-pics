// NSFW detection temporarily disabled
/*
import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { imageUrl } = req.body;

    const response = await axios.post(
      `https://api.pixlab.io/nsfw`,
      {
        img: imageUrl,
        key: process.env.PIXLAB_API_KEY
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error checking NSFW:', error);
    return res.status(500).json({
      message: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}
*/

// Temporary placeholder endpoint
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.status(200).json({ message: 'NSFW detection temporarily disabled' });
}