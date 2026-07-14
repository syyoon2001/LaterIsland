const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

// Uploads a File to Cloudinary via api/upload-image.js (the API secret never
// leaves the server). The original file is stored untouched; `url` is its
// permanent, unmodified secure_url — used later for "download original".
export async function uploadImageToCloudinary(file: File): Promise<{ publicId: string; url: string }> {
  const dataUrl = await readFileAsDataUrl(file);
  const res = await fetch('/api/upload-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: dataUrl }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Image upload failed.');
  }
  const data = await res.json();
  return { publicId: data.publicId, url: data.url };
}

// Builds an on-the-fly optimized delivery URL for a stored image — no
// separate resized copy is saved, Cloudinary generates it per request.
function cloudinaryUrl(publicId: string, width: number): string {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto,w_${width}/${publicId}`;
}

// Small square-ish thumbnail for content cards.
export function cloudinaryThumbUrl(publicId: string): string {
  return cloudinaryUrl(publicId, 200);
}

// Larger preview for the fullscreen image modal.
export function cloudinaryModalUrl(publicId: string): string {
  return cloudinaryUrl(publicId, 1200);
}
