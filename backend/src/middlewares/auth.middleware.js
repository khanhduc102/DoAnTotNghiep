// Xac thuc JWT va phan quyen theo role
const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { verifyToken } = require('../utils/jwt');

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
    throw ApiError.unauthorized('Thieu token xac thuc');
  }

  const token = header.slice(7).trim();
  let payload;

  try {
    payload = verifyToken(token);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Phien dang nhap da het han, vui long dang nhap lai');
    }
    throw ApiError.unauthorized('Token khong hop le');
  }

  const found = await prisma.user.findUnique({
    where: { id: payload.id },
    select: { ...USER_PUBLIC_FIELDS, tokenVersion: true },
  });

  if (!found) {
    throw ApiError.unauthorized('Tai khoan khong con ton tai');
  }

  // Token cap truoc lan logout gan nhat (hoac truoc khi co co che nay) -> het hieu luc
  const { tokenVersion, ...user } = found;
  if (payload.ver !== tokenVersion) {
    throw ApiError.unauthorized('Phien dang nhap da ket thuc, vui long dang nhap lai');
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
