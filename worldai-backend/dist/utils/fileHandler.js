import fs from 'fs';
import path from 'path';
import https from 'https';
import { v4 as uuidv4 } from 'uuid';
const createUploadDirs = () => {
    const dirs = ['uploads', 'uploads/images', 'uploads/videos', 'uploads/audio'];
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
};
export const downloadAndSaveFile = async (url, type) => {
    createUploadDirs();
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            const contentType = response.headers['content-type'];
            let extension;
            if (contentType.includes('image')) {
                extension = contentType.split('/')[1];
            }
            else if (contentType.includes('video')) {
                extension = 'mp4';
            }
            else if (url.includes('mp3')) {
                extension = 'mp3';
            }
            else {
                extension = 'unknown';
            }
            const filename = `${uuidv4()}.${extension}`;
            const directory = type === 'video' ? 'uploads/videos' :
                type === 'audio' ? 'uploads/audio' :
                    'uploads/images';
            const filepath = path.join(directory, filename);
            const fileStream = fs.createWriteStream(filepath);
            response.pipe(fileStream);
            fileStream.on('finish', () => {
                fileStream.close();
                resolve({
                    localUrl: `${process.env.BACKEND_BASE_URL}/${filepath}`,
                    filename: filename,
                    originalUrl: url
                });
            });
            fileStream.on('error', (err) => {
                fs.unlink(filepath, () => {
                    reject(err);
                });
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
};
export const deleteFile = (filepath) => {
    if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        return true;
    }
    return false;
};
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
