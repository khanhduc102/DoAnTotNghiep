// Xac thuc JWT va phan quyen theo role
const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { verifyAccessToken } = require('../utils/jwt');

// Cac truong cua user duoc gan vao req.user (khong bao gio kem password)
const USER_PUBLIC_FIELDS = {
  id: true,
  email: true,
  phone: true,
  fullName: true,
  avatar: true,
  role: true,
  status: true,
  createdAt: true,
};

// Bat buoc dang nhap. Gan req.user neu token hop le.
const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';

  if (!header.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Thieu access token');
  }

  const token = header.slice(7).trim();
  let payload;

  try {
    payload = verifyAccessToken(token);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Access token da het han');
    }
    throw ApiError.unauthorized('Access token khong hop le');
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: USER_PUBLIC_FIELDS,
  });

  if (!user) {
    throw ApiError.unauthorized('Tai khoan khong con ton tai');
  }

  if (user.status === 'LOCKED') {
    throw ApiError.forbidden('Tai khoan da bi khoa');
  }

  req.user = user;
  next();
});

// Chan theo role. Dung sau authenticate. Vi du: authorize('ADMIN')
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(ApiError.unauthorized());
  }

  if (!roles.includes(req.user.role)) {
    return next(ApiError.forbidden('Ban khong co quyen truy cap chuc nang nay'));
  }

  next();
};

module.exports = { authenticate, authorize, USER_PUBLIC_FIELDS };
