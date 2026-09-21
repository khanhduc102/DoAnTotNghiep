// Nhan request - goi service - tra response. Khong chua logic nghiep vu.
const asyncHandler = require('../../utils/asyncHandler');
const { ok, created } = require('../../utils/response');
const authService = require('./auth.service');

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  created(res, result, 'Dang ky thanh cong');
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  ok(res, result, 'Dang nhap thanh cong');
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user.id);
  ok(res, null, 'Dang xuat thanh cong');
});

const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user.id);
  ok(res, user, 'Lay thong tin ca nhan thanh cong');
});

const updateMe = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user.id, req.body);
  ok(res, user, 'Cap nhat ho so thanh cong');
});

const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.user.id, req.body);
  ok(res, null, 'Doi mat khau thanh cong');
});

module.exports = { register, login, logout, getMe, updateMe, changePassword };
