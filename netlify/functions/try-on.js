/**
 * VIRAAS AI Try-On Serverless Function
 *
 * This is the secure backend endpoint for AI Virtual Try-On.
 * AI API keys must ONLY be stored here (server-side), never in VITE_ frontend variables.
 *
 * Provider abstraction — swap out generateTryOn() to change AI providers.
 */

const TRYON_MODE = process.env.TRYON_MODE || 'demo';

// Provider abstraction — replace this with your actual AI provider call
async function generateTryOn({ userImageBase64, productId, garmentDescription, colour, silhouette }) {
  if (TRYON_MODE === 'demo') {
    // Demo mode: return a demo result without calling any real AI
    return {
      status: 'demo',
      message: 'Demo mode active. Connect a real AI provider for production Try-On.',
      resultImageUrl: null,
    };
  }

  // Production: connect your AI provider here
  // Example: call your AI Try-On API
  // const AI_KEY = process.env.AI_PROVIDER_API_KEY;
  // const response = await fetch('YOUR_AI_ENDPOINT', { ... });
  // return response result

  throw new Error('Production AI provider not configured. Set TRYON_MODE=demo or configure your AI provider.');
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { userImageBase64, productId, garmentDescription, colour, silhouette } = body;

    if (!productId) {
      return { statusCode: 400, body: JSON.stringify({ error: 'productId is required' }) };
    }

    // Basic validation
    if (userImageBase64) {
      const sizeInBytes = Buffer.byteLength(userImageBase64, 'base64');
      if (sizeInBytes > 10 * 1024 * 1024) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Image too large. Maximum 10MB.' }) };
      }
    }

    const result = await generateTryOn({ userImageBase64, productId, garmentDescription, colour, silhouette });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Something went wrong while creating your look. Please try again with a clearer photo.' }),
    };
  }
};
