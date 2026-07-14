import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

// Uploads a content item's image to /images/{uid}/{itemId}/{filename} and
// returns its public download URL. Storage rules restrict this path to the
// owning uid only (see storage.rules).
export async function uploadItemImage(uid: string, itemId: string, file: File): Promise<string> {
  const imageRef = ref(storage, `images/${uid}/${itemId}/${file.name}`);
  await uploadBytes(imageRef, file);
  return getDownloadURL(imageRef);
}
