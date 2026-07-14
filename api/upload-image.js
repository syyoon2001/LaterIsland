import { v2 as cloudinary } from 'cloudinary';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function configureCloudinary() {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud_name || !api_key || !api_secret) {
    throw new Error('Cloudinary environment variables are not set.');
  }
  cloudinary.config({ cloud_name, api_key, api_secret });
}

// data:<mime>;base64,<data>
function parseDataUrl(dataUrl) {
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl || '');
  if (!match) return null;
  const [, mimeType, base64] = match;
  return { mimeType, base64 };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  const { image } = req.body || {};
  if (!image || typeof image !== 'string') {
    return res.status(400).json({ error: 'Bad Request. Provide an image as a base64 data URL.' });
  }

  const parsed = parseDataUrl(image);
  if (!parsed) {
    return res.status(400).json({ error: 'Bad Request. Image must be a base64 data URL.' });
  }
  if (!ALLOWED_MIME_TYPES.includes(parsed.mimeType)) {
    return res.status(400).json({ error: 'Unsupported image type. Only jpg, png, webp, or gif are allowed.' });
  }
  // base64 encodes 3 bytes as 4 chars; approximate decoded size from string length.
  const approxBytes = Math.ceil((parsed.base64.length * 3) / 4);
  if (approxBytes > MAX_IMAGE_BYTES) {
    return res.status(400).json({ error: 'Image exceeds the 5MB size limit.' });
  }

  try {
    configureCloudinary();
    // Plain upload, no incoming transformation — the original file is
    // preserved as-is so it can be downloaded unmodified later. Resized /
    // compressed variants are generated on the fly via URL transformations
    // when displaying thumbnails, not stored separately.
    const result = await cloudinary.uploader.upload(image, {
      folder: 'later-island',
      resource_type: 'image',
    });
    return res.status(200).json({ publicId: result.public_id, url: result.secure_url });
  } catch (error) {
    console.error('upload-image error:', error);
    return res.status(502).json({ error: 'Failed to upload image to Cloudinary.', details: error.message });
  }
}
