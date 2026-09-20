// Loi co chu dich (loi nghiep vu) - error handler se doc statusCode tu day
class ApiError extends Error {
  constructor(statusCode, message, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors; // danh sach loi chi tiet tung field (neu co)
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Du lieu khong hop le', errors = null) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = 'Ban chua dang nhap') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Ban khong co quyen thuc hien thao tac nay') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Khong tim thay du lieu') {
    return new ApiError(404, message);
  }

  static conflict(message = 'Du lieu da ton tai') {
    return new ApiError(409, message);
  }
}

module.exports = ApiError;
