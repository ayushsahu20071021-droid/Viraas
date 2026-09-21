/**
 * VIRAAS AI Try-On Serverless Function (ESM — the repo package.json sets "type": "module")
 *
 * This is the secure backend endpoint for AI Virtual Try-On.
 * AI API keys must ONLY live here (server-side env), never in VITE_ frontend variables.
 *
 * Provider abstraction — swap out generateTryOn() to change AI providers.
 * TRYON_MODE=demo (default): returns a clearly-labelled demo response, never a fake render.
 */

const TRYON_MODE = process.env.TRYON_MODE || 'demo';

// Provider abstraction — replace this with your actual AI provider call.
async function generateTryOn({ userImageBase64, productId, garmentDescription, colour, silhouette }) {
  if (TRYON_MODE === 'demo') {
    // Demo mode: no provider is called and no image is produced client-side beyond this request.
    return {
      status: 'demo',
      message: 'Demo mode active — no AI provider is connected yet, so this is a labelled preview, not a rendered try-on.',
      resultImageUrl: null,
    };
  }

  // Production: connect your AI provider here.
  // const AI_KEY = process.env.AI_PROVIDER_API_KEY;   // server-side only
  // const response = await fetch(process.env.AI_PROVIDER_ENDPOINT, { ... });
  // return { status: 'ok', resultImageUrl }
  throw new Error('Production AI provider not configured. Set TRYON_MODE=demo or configure your AI provider.');
}

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { userImageBase64, productId, garmentDescription, colour, silhouette } = body;

    if (!productId) {
      return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'productId is required' }) };
    }

    // Basic validation — reject oversized payloads before they touch any provider.
    if (userImageBase64) {
      const sizeInBytes = Buffer.byteLength(userImageBase64, 'base64');
      if (sizeInBytes > 10 * 1024 * 1024) {
        return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Image too large. Maximum 10MB.' }) };
      }
    }

    const result = await generateTryOn({ userImageBase64, productId, garmentDescription, colour, silhouette });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result),
    };
  } catch (error) {
    // Never echo the photo or stack trace to the client.
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Something went wrong while creating your look. Please try again with a clearer photo.' }),
    };
  }
};
