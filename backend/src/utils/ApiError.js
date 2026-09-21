// Loi co chu dich (loi nghiep vu) - error handler se doc statusCode tu day
class ApiError extends Error {
  constructor(statusCode, message, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors; // danh sach loi chi tiet tung field (neu co)
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Dữ liệu không hợp lệ', errors = null) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = 'Bạn chưa đăng nhập') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Bạn không có quyền thực hiện thao tác này') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Không tìm thấy dữ liệu') {
    return new ApiError(404, message);
  }

  static conflict(message = 'Dữ liệu đã tồn tại') {
    return new ApiError(409, message);
  }
}

module.exports = ApiError;
