import { BASE_URL, getAuthToken } from './api';

/**
 * Uploads a local image URI to Cloudinary via the backend upload endpoint.
 * Returns the secure CDN URL.
 *
 * Throws on failure rather than returning null. The previous version swallowed
 * every error into a console.warn and returned null, so a failed upload was
 * indistinguishable from "no photo attached": the report saved with
 * photoUrl: null and nothing told the user their picture had been dropped.
 */
export async function uploadImageToCloudinary(localUri: string): Promise<string> {
  const uploadUrl = `${BASE_URL}/upload`;

  // /api/v1/upload is not a public route — the middleware requires a Bearer
  // token. This used to be a bare fetch with no Authorization header, so every
  // upload came back 401 "Authentication required" and no photo ever reached
  // Cloudinary. The Cloudinary credentials were never the problem.
  const token = await getAuthToken();
  if (!token) {
    throw new Error('You need to be signed in to attach a photo.');
  }

  const filename = localUri.split('/').pop() ?? 'photo.jpg';
  const mimeType = filename.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';

  const formData = new FormData();
  formData.append('file', {
    uri: localUri,
    name: filename,
    type: mimeType,
  } as any);

  const response = await fetch(uploadUrl, {
    method: 'POST',
    // Only Authorization — setting Content-Type by hand would drop the
    // multipart boundary that fetch generates.
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const text = await response.text();
  if (!response.ok) {
    let message = `Photo upload failed (${response.status})`;
    try {
      const parsed = JSON.parse(text);
      if (parsed?.error) message = parsed.error;
    } catch {
      /* non-JSON body: keep the status-code message */
    }
    throw new Error(message);
  }

  const data = JSON.parse(text);
  if (!data.url) throw new Error('Upload succeeded but returned no image URL.');
  return data.url;
}
