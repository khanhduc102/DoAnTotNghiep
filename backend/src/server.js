const app = require('./app');
const env = require('./config/env');
const prisma = require('./config/prisma');

const start = async () => {
  try {
    await prisma.$connect();
    console.log('[DB] Ket noi MySQL thanh cong');

    app.listen(env.port, () => {
      console.log(`[SERVER] DUCHOME API chay tai http://localhost:${env.port}`);
      console.log(`[SERVER] Moi truong: ${env.nodeEnv}`);
    });
  } catch (err) {
    console.error('[DB] Khong ket noi duoc MySQL:', err.message);
    process.exit(1);
  }
};

// Dong ket noi gon gang khi tat server
const shutdown = async (signal) => {
  console.log(`\n[SERVER] Nhan ${signal}, dang dong ket noi...`);
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

start();
