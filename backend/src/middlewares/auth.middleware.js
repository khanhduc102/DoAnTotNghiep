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
    throw ApiError.unauthorized('Thiếu token xác thực');
  }

  const token = header.slice(7).trim();
  let payload;

  try {
    payload = verifyToken(token);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
    }
    throw ApiError.unauthorized('Token không hợp lệ');
  }

  const found = await prisma.user.findUnique({
    where: { id: payload.id },
    select: { ...USER_PUBLIC_FIELDS, tokenVersion: true },
  });

  if (!found) {
    throw ApiError.unauthorized('Tài khoản không còn tồn tại');
  }

  // Token cap truoc lan logout gan nhat (hoac truoc khi co co che nay) -> het hieu luc
  const { tokenVersion, ...user } = found;
  if (payload.ver !== tokenVersion) {
    throw ApiError.unauthorized('Phiên đăng nhập đã kết thúc, vui lòng đăng nhập lại');
  }

  if (user.status === 'LOCKED') {
    throw ApiError.forbidden('Tài khoản đã bị khóa');
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
    return next(ApiError.forbidden('Bạn không có quyền truy cập chức năng này'));
  }

  next();
};

module.exports = { authenticate, authorize, USER_PUBLIC_FIELDS };
