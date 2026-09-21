// Nhan request - goi service - tra response. Khong chua logic nghiep vu.
const asyncHandler = require('../../utils/asyncHandler');
const { ok, created } = require('../../utils/response');
const authService = require('./auth.service');

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  created(res, result, 'Đăng ký thành công');
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  ok(res, result, 'Đăng nhập thành công');
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user.id);
  ok(res, null, 'Đăng xuất thành công');
});

const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user.id);
  ok(res, user, 'Lấy thông tin cá nhân thành công');
});

const updateMe = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user.id, req.body);
  ok(res, user, 'Cập nhật hồ sơ thành công');
});

const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.user.id, req.body);
  ok(res, null, 'Đổi mật khẩu thành công');
});

module.exports = { register, login, logout, getMe, updateMe, changePassword };
