import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import { logger } from '@/utils/logger';

const DOWNLOAD_DIR = path.join(process.cwd(), 'downloads');
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

// Run every hour
export const initCronJobs = () => {
    cron.schedule('0 * * * *', () => {
        logger.info('[CRON] Starting download cleanup job...');
        
        if (!fs.existsSync(DOWNLOAD_DIR)) {
            logger.info('[CRON] No downloads directory found, skipping cleanup.');
            return;
        }

        fs.readdir(DOWNLOAD_DIR, (err, files) => {
            if (err) {
                logger.error(`[CRON] Error reading downloads directory: ${err.message}`);
                return;
            }

            const now = Date.now();
            let deletedCount = 0;

            files.forEach(file => {
                const filePath = path.join(DOWNLOAD_DIR, file);
                
                fs.stat(filePath, (err, stats) => {
                    if (err) {
                        logger.error(`[CRON] Error getting file stats for ${file}: ${err.message}`);
                        return;
                    }

                    if (now - stats.mtimeMs > MAX_AGE_MS) {
                        fs.unlink(filePath, err => {
                            if (err) {
                                logger.error(`[CRON] Error deleting file ${file}: ${err.message}`);
                            } else {
                                logger.info(`[CRON] Deleted old file: ${file}`);
                                deletedCount++;
                            }
                        });
                    }
                });
            });
            
            logger.info(`[CRON] Cleanup job finished. Found and deleting ${deletedCount} files.`);
        });
    });
};
