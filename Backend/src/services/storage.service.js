import ImageKit, { toFile } from '@imagekit/nodejs';
import { config } from '../config/config.js';

const client = new ImageKit({
    privateKey: config.IMAGEKIT_PRIVATE_KEY
});

export async function uploadFile({ buffer, fileName, mimeType, folder = 'snitch/products' }) {
    try {
        const safeName = (fileName || `img_${Date.now()}.png`).replace(/[^a-zA-Z0-9._-]/g, '_');
        const fileObj = await toFile(buffer, safeName, mimeType ? { type: mimeType } : undefined);

        const result = await client.files.upload({
            file: fileObj,
            fileName: safeName,
            folder: folder,
        });

        return {
            url: result.url,
            fileId: result.fileId,
            result
        };
    } catch (error) {
        console.error(`[IMAGEKIT UPLOAD ERROR] File "${fileName}":`, error);
        throw new Error(`Image upload failed for "${fileName}": ${error.message}`);
    }
}