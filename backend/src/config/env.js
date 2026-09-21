// Doc va kiem tra bien moi truong. Import file nay dau tien truoc moi thu khac.
require('dotenv').config();

// Cac bien bat buoc phai co, thieu la dung server ngay thay vi loi mo ho luc chay
const REQUIRED = ['DATABASE_URL', 'JWT_SECRET'];
const missing = REQUIRED.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error('[ENV] Thieu bien moi truong bat buoc:', missing.join(', '));
  console.error('[ENV] Hay copy backend/.env.example thanh backend/.env va dien day du.');
  process.exit(1);
}

const env = {
  port: Number(process.env.PORT) || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: (process.env.NODE_ENV || 'development') === 'development',

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  upload: {
    dir: process.env.UPLOAD_DIR || 'uploads',
    maxFileSizeMb: Number(process.env.MAX_FILE_SIZE_MB) || 5,
  },
};

module.exports = env;
