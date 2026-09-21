const asyncHandler = require('../../utils/asyncHandler');
const { ok } = require('../../utils/response');
const dashboardService = require('./dashboard.service');

const tenant = asyncHandler(async (req, res) => {
  const data = await dashboardService.getTenantDashboard(req.user.id);
  ok(res, data, 'Lay tong quan khach thue thanh cong');
});

const owner = asyncHandler(async (req, res) => {
  const data = await dashboardService.getOwnerDashboard(req.user.id);
  ok(res, data, 'Lay tong quan chu tro thanh cong');
});

const admin = asyncHandler(async (req, res) => {
  const data = await dashboardService.getAdminDashboard();
  ok(res, data, 'Lay tong quan he thong thanh cong');
});

module.exports = { tenant, owner, admin };
