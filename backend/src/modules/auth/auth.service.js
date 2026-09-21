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
    throw ApiError.conflict('Email đã được sử dụng');
  }

  if (phone) {
    const existedPhone = await prisma.user.findUnique({ where: { phone } });
    if (existedPhone) {
      throw ApiError.conflict('Số điện thoại đã được sử dụng');
    }
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const { tokenVersion, ...user } = await prisma.user.create({
    data: { email, password: hashedPassword, fullName, phone, role },
    select: { ...USER_PUBLIC_FIELDS, tokenVersion: true },
  });

  return { user, token: signToken({ ...user, tokenVersion }) };
};

// Dang nhap bang email + mat khau
const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });

  // Bao loi chung chung de khong lo email nao ton tai trong he thong
  if (!user) {
    throw ApiError.unauthorized('Email hoặc mật khẩu không chính xác');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw ApiError.unauthorized('Email hoặc mật khẩu không chính xác');
  }

  if (user.status === 'LOCKED') {
    throw ApiError.forbidden('Tài khoản đã bị khóa, vui lòng liên hệ quản trị viên');
  }

  const { password: _password, tokenVersion: _version, ...safeUser } = user;
  return { user: safeUser, token: signToken(user) };
};

// Dang xuat: tang tokenVersion de moi token da cap cho user nay (tren moi thiet bi) het hieu luc
const logout = async (userId) => {
  await prisma.user.update({
    where: { id: userId },
    data: { tokenVersion: { increment: 1 } },
  });
};

// Lay thong tin ca nhan
const getProfile = async (userId) =>
  prisma.user.findUnique({ where: { id: userId }, select: USER_PUBLIC_FIELDS });

// Cap nhat ho so ca nhan
const updateProfile = async (userId, data) => {
  if (data.phone) {
    const existedPhone = await prisma.user.findUnique({ where: { phone: data.phone } });
    if (existedPhone && existedPhone.id !== userId) {
      throw ApiError.conflict('Số điện thoại đã được sử dụng');
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
    throw ApiError.notFound('Tài khoản không tồn tại');
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw ApiError.badRequest('Mật khẩu hiện tại không đúng');
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
  logout,
  getProfile,
  updateProfile,
  changePassword,
};
