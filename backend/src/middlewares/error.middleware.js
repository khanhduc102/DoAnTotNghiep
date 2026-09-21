// Xu ly loi tap trung - moi loi trong app deu ve day
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

// Goi khi khong route nao khop
const notFoundHandler = (req, res, next) => {
  next(ApiError.notFound(`Không tìm thấy endpoint ${req.method} ${req.originalUrl}`));
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Lỗi hệ thống';
  const errors = err.errors || undefined;

  // Dich mot so ma loi Prisma hay gap sang thong bao de hieu
  if (err.code === 'P2002') {
    statusCode = 409;
    const field = err.meta?.target?.[0] || 'Giá trị';
    message = `${field} đã tồn tại trong hệ thống`;
  } else if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Không tìm thấy bản ghi cần thao tác';
  } else if (err.code === 'P2003') {
    statusCode = 400;
    message = 'Dữ liệu tham chiếu không hợp lệ';
  }

  // Loi 500 la loi ngoai du tinh, log ra de con debug
  if (statusCode >= 500) {
    console.error('[ERROR]', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
    ...(env.isDev && statusCode >= 500 ? { stack: err.stack } : {}),
  });
};

module.exports = { notFoundHandler, errorHandler };
