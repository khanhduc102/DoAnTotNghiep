const asyncHandler = require('../../utils/asyncHandler');
const { ok } = require('../../utils/response');
const dashboardService = require('./dashboard.service');

const tenant = asyncHandler(async (req, res) => {
  const data = await dashboardService.getTenantDashboard(req.user.id);
  ok(res, data, 'Lấy tổng quan khách thuê thành công');
});

const owner = asyncHandler(async (req, res) => {
  const data = await dashboardService.getOwnerDashboard(req.user.id);
  ok(res, data, 'Lấy tổng quan chủ trọ thành công');
});

const admin = asyncHandler(async (req, res) => {
  const data = await dashboardService.getAdminDashboard();
  ok(res, data, 'Lấy tổng quan hệ thống thành công');
});

module.exports = { tenant, owner, admin };
