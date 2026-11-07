import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

const config = {
  PORT: parseInt(process.env.PORT || '3001', 10),
  DATA_DIR: path.join(PROJECT_ROOT, 'clinic_data'),
  BACKUP_DIR: path.join(PROJECT_ROOT, 'clinic_data', 'backups'),
};

// Ensure directories exist on import
fs.mkdirSync(config.DATA_DIR, { recursive: true });
fs.mkdirSync(config.BACKUP_DIR, { recursive: true });

export default config;
