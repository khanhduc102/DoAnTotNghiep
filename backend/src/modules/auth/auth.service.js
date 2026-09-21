// Xu ly nghiep vu xac thuc. Tang nay goi thang Prisma, khong biet gi ve req/res.
const bcrypt = require('bcryptjs');
const prisma = require('../../config/prisma');
const ApiError = require('../../utils/ApiError');
const { signToken } = require('../../utils/jwt');
const { USER_PUBLIC_FIELDS } = require('../../middlewares/auth.middleware');

const SALT_ROUNDS = 10;

// Dang ky tai khoan moi (OWNER hoac TENANT)
const register = async ({ email, password, fullName, phone, role }) => {
  const existedEmail = await prisma.user.findUnique({ where: { email } });
  if (existedEmail) {
    throw ApiError.conflict('Email da duoc su dung');
  }

  if (phone) {
    const existedPhone = await prisma.user.findUnique({ where: { phone } });
    if (existedPhone) {
      throw ApiError.conflict('So dien thoai da duoc su dung');
    }
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: { email, password: hashedPassword, fullName, phone, role },
    select: USER_PUBLIC_FIELDS,
  });

  return { user, token: signToken(user) };
};

// Dang nhap bang email + mat khau
const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });

  // Bao loi chung chung de khong lo email nao ton tai trong he thong
  if (!user) {
    throw ApiError.unauthorized('Email hoac mat khau khong dung');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw ApiError.unauthorized('Email hoac mat khau khong dung');
  }

  if (user.status === 'LOCKED') {
    throw ApiError.forbidden('Tai khoan da bi khoa, vui long lien he quan tri vien');
  }

  const { password: _removed, ...safeUser } = user;
  return { user: safeUser, token: signToken(user) };
};

// Lay thong tin ca nhan
const getProfile = async (userId) =>
  prisma.user.findUnique({ where: { id: userId }, select: USER_PUBLIC_FIELDS });

// Cap nhat ho so ca nhan
const updateProfile = async (userId, data) => {
  if (data.phone) {
    const existedPhone = await prisma.user.findUnique({ where: { phone: data.phone } });
    if (existedPhone && existedPhone.id !== userId) {
      throw ApiError.conflict('So dien thoai da duoc su dung');
    }
  }

  return prisma.user.update({
    where: { id: userId },
    data,
    select: USER_PUBLIC_FIELDS,
  });
};

// Doi mat khau
const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw ApiError.notFound('Tai khoan khong ton tai');
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw ApiError.badRequest('Mat khau hien tai khong dung');
  }

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
};
