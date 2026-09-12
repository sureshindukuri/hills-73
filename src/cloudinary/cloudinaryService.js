/**
 * Cloudinary Direct Unsigned Video & Media Upload Service for 73 Hills Resort
 * 
 * Provides permanent, high-speed CDN video hosting without exposing API secrets.
 * Direct browser-to-Cloudinary streaming with real-time percentage progress.
 */

// Default Cloudinary configuration (can be overridden via .env or Admin Panel)
export const CLOUDINARY_CONFIG = {
  get cloudName() {
    return (
      (typeof process !== 'undefined' && process.env && (process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME)) ||
      (typeof localStorage !== 'undefined' && localStorage.getItem('73hills_cloudinary_cloud_name')) ||
      'dqveovxly'
    );
  },
  get uploadPreset() {
    return (
      (typeof process !== 'undefined' && process.env && (process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || process.env.VITE_CLOUDINARY_UPLOAD_PRESET)) ||
      (typeof localStorage !== 'undefined' && localStorage.getItem('73hills_cloudinary_upload_preset')) ||
      'hills73_unsigned'
    );
  }
};

/**
 * Validate video file type and size
 */
export function validateVideoFile(file, maxSizeBytes = 100 * 1024 * 1024) {
  if (!file) {
    throw new Error('No video file selected. Please select a video file from your device.');
  }

  const validMimeTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/ogg', 'video/x-matroska', 'video/mov'];
  const validExtensions = ['.mp4', '.webm', '.mov', '.ogg', '.mkv', '.m4v'];

  const fileName = (file.name || '').toLowerCase();
  const fileType = (file.type || '').toLowerCase();

  const hasValidExt = validExtensions.some(ext => fileName.endsWith(ext));
  const hasValidMime = fileType.startsWith('video/') || validMimeTypes.includes(fileType);

  if (!hasValidExt && !hasValidMime) {
    throw new Error('Invalid file format. Please select an MP4, WebM, or MOV video file.');
  }

  if (file.size > maxSizeBytes) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    throw new Error(`Video file is too large (${sizeMB} MB). Maximum supported size is 100 MB. Please compress the video first or provide a video streaming URL.`);
  }

  return true;
}

/**
 * Upload video file directly to Cloudinary using unsigned upload preset
 * @param {File} file - Browser File object
 * @param {Function} onProgress - Progress callback receiving percentage (0-100)
 * @returns {Promise<string>} Permanent HTTPS Cloudinary secure_url
 */
export async function uploadVideoToCloudinary(file, onProgress = null) {
  validateVideoFile(file);

  const cloudName = CLOUDINARY_CONFIG.cloudName;
  const uploadPreset = CLOUDINARY_CONFIG.uploadPreset;

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary configuration is missing. Please check CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET.');
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`;

    xhr.open('POST', endpoint, true);

    // Track upload progress
    if (xhr.upload && typeof onProgress === 'function') {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 98);
          onProgress(percent);
        }
      };
    }

    // Handle response
    xhr.onload = () => {
      try {
        const response = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && response.secure_url) {
          if (typeof onProgress === 'function') onProgress(100);
          console.log('[Cloudinary] Video uploaded successfully:', response.secure_url);
          resolve(response.secure_url);
        } else {
          const errorMsg = response.error?.message || `Cloudinary upload failed with status ${xhr.status}`;
          console.error('[Cloudinary] Upload error response:', response);
          reject(new Error(errorMsg));
        }
      } catch (err) {
        console.error('[Cloudinary] Response parsing error:', err, xhr.responseText);
        reject(new Error(`Failed to parse Cloudinary response: ${xhr.statusText || 'Server Error'}`));
      }
    };

    // Handle network errors
    xhr.onerror = () => {
      console.error('[Cloudinary] Network connection error');
      reject(new Error('Network error during video upload. Please check your internet connection and try again.'));
    };

    // Timeout after 5 minutes for large videos
    xhr.ontimeout = () => {
      console.error('[Cloudinary] Upload timed out');
      reject(new Error('Video upload timed out. Please check your internet connection or use a smaller video file.'));
    };
    xhr.timeout = 300000; // 5 minutes

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', '73hills_resort_videos');

    xhr.send(formData);
  });
}
