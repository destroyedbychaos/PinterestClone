export class WebsiteScraper {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000;
        this.imageCache = new Map();
    }

    async fetchImages(url) {
        const cached = this.cache.get(url);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            console.log('Using cached images for', url);
            return cached.data;
        }

        try {
            console.log('Fetching images for URL:', url);
            const res = await fetch(`/api/pins/extract-images?websiteUrl=${encodeURIComponent(url)}`);
            
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ message: res.statusText }));
                console.error('HTTP error response:', res.status, errorData);
                throw new Error(`HTTP error! Status: ${res.status}, Message: ${errorData.message || errorData.Message || res.statusText}`);
            }

            const data = await res.json();
            console.log('Received data structure:', data);

            let imagesArray = [];
            if (Array.isArray(data)) {
                imagesArray = data;
            } else if (data.Images && Array.isArray(data.Images)) {
                imagesArray = data.Images;
            } else if (data.images && Array.isArray(data.images)) {
                imagesArray = data.images;
            } else {
                console.warn('Unexpected response format from backend:', data);
                console.warn('Expected array or object with Images property');
                return [];
            }
            
            const processedImages = imagesArray.map((img, index) => ({
                id: img.Id || img.id || `img_${Date.now()}_${index}`,
                url: img.Url || img.url || img.src,
                alt: img.Alt || img.alt || img.title || '',
                title: img.Title || img.title || '',
                width: img.Width || img.width || null,
                height: img.Height || img.height || null,
                loading: img.Loading || img.loading || '',
                tags: img.Tags || img.tags || '',
                originalUrl: img.Url || img.url || img.src
            })).filter(img => img.url);

            console.log(`Processed ${processedImages.length} images from website`);

            this.cache.set(url, { 
                data: processedImages, 
                timestamp: Date.now() 
            });
            
            return processedImages;
        } catch (err) {
            console.error('Error fetching images:', err);
            console.error('URL:', url);
            console.error('Error details:', err.message);
            throw err;
        }
    }

    async imageToFile(imageUrl, filename = null) {
        const cacheKey = imageUrl;
        if (this.imageCache.has(cacheKey)) {
            const cached = this.imageCache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.file;
            }
            this.imageCache.delete(cacheKey);
        }

        try {
            console.log('Converting image URL to file:', imageUrl);
            
            let response;
            
            // Always use backend proxy for external images to avoid CORS issues
            try {
                console.log('Using backend proxy for image:', imageUrl);
                response = await fetch(`/api/pins/proxy-image?url=${encodeURIComponent(imageUrl)}`);
                
                if (!response.ok) {
                    throw new Error(`Proxy failed with status: ${response.status}`);
                }
            } catch (proxyError) {
                console.error('Backend proxy failed:', proxyError);
                // Try direct fetch as last resort (will likely fail for external images)
                console.log('Attempting direct fetch as fallback');
                response = await fetch(imageUrl, {
                    mode: 'cors',
                    credentials: 'omit'
                });
                
                if (!response.ok) {
                    throw new Error(`Direct fetch failed with status: ${response.status}`);
                }
            }

            const blob = await response.blob();
    
            if (!filename) {
                const urlParts = imageUrl.split('/');
                filename = urlParts[urlParts.length - 1].split('?')[0] || 'image.jpg';
                
                if (!filename.includes('.')) {
                    const contentType = blob.type;
                    const extension = this.getExtensionFromMimeType(contentType) || 'jpg';
                    filename = `image.${extension}`;
                }
            }

            const file = new File([blob], filename, { 
                type: blob.type || 'image/jpeg' 
            });

            this.imageCache.set(cacheKey, {
                file,
                timestamp: Date.now()
            });

            console.log('Successfully converted image to file:', filename, file.size, 'bytes');
            return file;
        } catch (err) {
            console.error('Failed to convert image to file:', imageUrl, err);
            return null;
        }
    }

    getExtensionFromMimeType(mimeType) {
        const mimeMap = {
            'image/jpeg': 'jpg',
            'image/jpg': 'jpg',
            'image/png': 'png',
            'image/gif': 'gif',
            'image/webp': 'webp',
            'image/svg+xml': 'svg',
            'image/bmp': 'bmp'
        };
        return mimeMap[mimeType] || 'jpg';
    }

    async createPreviewUrl(imageUrl) {
        try {
            console.log('Creating preview URL for:', imageUrl);
            const file = await this.imageToFile(imageUrl);
            if (file) {
                const previewUrl = URL.createObjectURL(file);
                console.log('Created preview URL:', previewUrl);
                return previewUrl;
            }
            console.log('Using original URL as fallback:', imageUrl);
            return imageUrl;
        } catch (err) {
            console.error('Failed to create preview URL:', err);
            return imageUrl;
        }
    }

    cleanupBlobUrl(url) {
        if (url && url.startsWith('blob:')) {
            try {
                URL.revokeObjectURL(url);
                console.log('Cleaned up blob URL:', url);
            } catch (err) {
                console.error('Error cleaning up blob URL:', err);
            }
        }
    }

    clearCache() {
        console.log('Clearing all caches');
        this.cache.clear();
        
        for (const [key, cached] of this.imageCache) {
            if (cached.file && cached.file instanceof File) {
                this.cleanupBlobUrl(URL.createObjectURL(cached.file));
            }
        }
        this.imageCache.clear();
    }

    getCacheStats() {
        return {
            urlCache: this.cache.size,
            imageCache: this.imageCache.size,
            cacheTimeout: this.cacheTimeout
        };
    }
}