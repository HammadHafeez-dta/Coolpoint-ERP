/**
 * Image compression utility using HTML5 Canvas
 * Resizes and compresses image files to optimize Base64 payload size.
 */

export interface CompressionOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number; // 0.1 to 1.0
    mimeType?: 'image/jpeg' | 'image/webp' | 'image/png';
}

export interface CompressionResult {
    base64: string; // Full data URL e.g. data:image/jpeg;base64,...
    rawBase64: string; // Stripped base64 string
    originalSize: number; // in bytes
    compressedSize: number; // in bytes
    width: number;
    height: number;
}

export async function compressImage(
    file: File | Blob,
    options: CompressionOptions = {}
): Promise<CompressionResult> {
    const {
        maxWidth = 1600,
        maxHeight = 1600,
        quality = 0.75,
        mimeType = 'image/jpeg',
    } = options;

    const originalSize = file.size;

    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                // Scale down if larger than max dimensions
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Failed to get 2D canvas context'));
                    return;
                }

                // Fill with white background (useful if transparent PNG is converted to JPEG)
                if (mimeType === 'image/jpeg') {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, width, height);
                }

                ctx.drawImage(img, 0, 0, width, height);

                const base64 = canvas.toDataURL(mimeType, quality);
                const rawBase64 = base64.includes(',') ? base64.split(',')[1] : base64;
                const compressedSize = Math.round((rawBase64.length * 3) / 4);

                resolve({
                    base64,
                    rawBase64,
                    originalSize,
                    compressedSize,
                    width,
                    height,
                });
            };

            img.onerror = (err) => reject(new Error('Failed to load image for compression'));
            img.src = event.target?.result as string;
        };

        reader.onerror = (err) => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
