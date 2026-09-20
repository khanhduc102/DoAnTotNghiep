// Boc controller async lai de khong phai viet try/catch o moi ham.
// Loi se tu dong chay sang error handler tap trung.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
