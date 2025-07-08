import fs from 'fs';
import path from 'path';
import https from 'https';
import { v4 as uuidv4 } from 'uuid';

// Create uploads directory structure if it doesn't exist
const createUploadDirs = () => {
  const dirs = ['uploads', 'uploads/images', 'uploads/videos', 'uploads/audio'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Download file from URL and save to local storage
export const downloadAndSaveFile = async (url, type) => {
  createUploadDirs();
  
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      // Get content type from response headers
      const contentType = response.headers['content-type'];
      
      // Determine file extension based on content type
      let extension;
      if (contentType.includes('image')) {
        extension = contentType.split('/')[1];
      } else if (contentType.includes('video')) {
        extension = 'mp4'; // Default to mp4 for videos
      } else if (url.includes('mp3')) {
        extension = 'mp3'; // Default to mp3 for audio
      } else {
        extension = 'unknown';
      }

      // Generate unique filename
      const filename = `${uuidv4()}.${extension}`;
      
      // Determine directory based on type
      const directory = type === 'video' ? 'uploads/videos' : 
                       type === 'audio' ? 'uploads/audio' :
                       'uploads/images';
      const filepath = path.join(directory, filename);
      
      // Create write stream
      const fileStream = fs.createWriteStream(filepath);
      
      // Pipe response to file
      response.pipe(fileStream);
      
      fileStream.on('finish', () => {
        fileStream.close();
        // Return local URL
        resolve({
          localUrl: `${process.env.BACKEND_BASE_URL}/${filepath}`,
          filename: filename,
          originalUrl: url
        });
      });
      
      fileStream.on('error', (err) => {
        // Clean up failed file
        fs.unlink(filepath, () => {
          reject(err);
        });
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
};

// Delete file from local storage
export const deleteFile = (filepath) => {
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
    return true;
  }
  return false;
};

// Get file info
export const getFileInfo = (filepath) => {
  if (fs.existsSync(filepath)) {
    const stats = fs.statSync(filepath);
    return {
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      exists: true
    };
  }
  return { exists: false };
}; 