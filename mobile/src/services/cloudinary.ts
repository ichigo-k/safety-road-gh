import { BASE_URL } from './api';

/**
 * Uploads a local image URI to Cloudinary via the backend upload endpoint.
 * Returns the secure CDN URL, or null if the upload fails.
 */
export async function uploadImageToCloudinary(localUri: string): Promise<string | null> {
    try {
        // Derive the upload URL from the same base (remove /api/v1, add /api/v1/upload)
        const uploadUrl = `${BASE_URL}/upload`;

        const filename = localUri.split('/').pop() ?? 'photo.jpg';
        const mimeType = filename.endsWith('.png') ? 'image/png' : 'image/jpeg';

        const formData = new FormData();
        formData.append('file', {
            uri: localUri,
            name: filename,
            type: mimeType,
        } as any);

        const response = await fetch(uploadUrl, {
            method: 'POST',
            body: formData,
            // Do NOT set Content-Type manually — let fetch set the boundary
        });

        if (!response.ok) {
            const text = await response.text();
            console.warn('[cloudinary] upload failed:', text);
            return null;
        }

        const data = await response.json();
        return data.url ?? null;
    } catch (err) {
        console.error('[cloudinary] upload error:', err);
        return null;
    }
}
