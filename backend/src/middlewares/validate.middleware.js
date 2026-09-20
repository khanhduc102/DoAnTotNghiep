// Kiem tra du lieu dau vao bang zod schema.
// Neu hop le thi ghi de req.body bang du lieu da chuan hoa (trim, ep kieu, gan default).
const ApiError = require('../utils/ApiError');

const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    return next(ApiError.badRequest('Du lieu khong hop le', errors));
  }

  req[source] = result.data;
  next();
};

module.exports = validate;
