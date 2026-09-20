// Tao du lieu mau ban dau. Chay duoc nhieu lan khong bi trung (dung upsert).
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = '123456';

const USERS = [
  { email: 'admin@duchome.vn', fullName: 'Quan tri he thong', phone: '0900000001', role: 'ADMIN' },
  { email: 'owner1@duchome.vn', fullName: 'Nguyen Van Chu', phone: '0900000002', role: 'OWNER' },
  { email: 'owner2@duchome.vn', fullName: 'Tran Thi Hoa', phone: '0900000003', role: 'OWNER' },
  { email: 'tenant1@duchome.vn', fullName: 'Le Minh Duc', phone: '0900000004', role: 'TENANT' },
  { email: 'tenant2@duchome.vn', fullName: 'Pham Thu Ha', phone: '0900000005', role: 'TENANT' },
  { email: 'tenant3@duchome.vn', fullName: 'Vo Quoc Bao', phone: '0900000006', role: 'TENANT' },
];

const AMENITIES = [
  { name: 'Wifi mien phi', icon: 'wifi' },
  { name: 'May lanh', icon: 'snow' },
  { name: 'Nong lanh', icon: 'water' },
  { name: 'Tu lanh', icon: 'fridge' },
  { name: 'May giat', icon: 'washing-machine' },
  { name: 'Gac lung', icon: 'stairs' },
  { name: 'Ban cong', icon: 'balcony' },
  { name: 'Cho de xe', icon: 'motorbike' },
  { name: 'Gio giac tu do', icon: 'clock' },
  { name: 'Ve sinh khep kin', icon: 'bath' },
  { name: 'Ke bep', icon: 'kitchen' },
  { name: 'An ninh 24/7', icon: 'shield' },
];

const main = async () => {
  console.log('[SEED] Bat dau tao du lieu mau...');

  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  for (const user of USERS) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: { ...user, password: hashedPassword },
    });
  }
  console.log(`[SEED] Da tao ${USERS.length} tai khoan`);

  for (const amenity of AMENITIES) {
    await prisma.amenity.upsert({
      where: { name: amenity.name },
      update: {},
      create: amenity,
    });
  }
  console.log(`[SEED] Da tao ${AMENITIES.length} tien ich`);

  console.log('\n===== TAI KHOAN DEMO (mat khau: %s) =====', DEFAULT_PASSWORD);
  USERS.forEach((u) => console.log(`  ${u.role.padEnd(7)} | ${u.email}`));
  console.log('=========================================\n');
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error('[SEED] Loi:', err);
    await prisma.$disconnect();
    process.exit(1);
  });
