// So lieu tong quan cho trang chu cua tung vai tro.
// Chi DEM ban ghi co san, khong xu ly nghiep vu phong / hop dong / hoa don.
const prisma = require('../../config/prisma');

// Chuyen ket qua groupBy thanh object { TRANG_THAI: so_luong }, trang thai khong co ban ghi = 0
const toCountMap = (rows, field, allValues) => {
  const map = Object.fromEntries(allValues.map((v) => [v, 0]));
  rows.forEach((row) => {
    map[row[field]] = row._count._all;
  });
  return map;
};

const getTenantDashboard = async (tenantId) => {
  const [requests, activeContracts, unpaidInvoices] = await Promise.all([
    prisma.rentalRequest.groupBy({ by: ['status'], where: { tenantId }, _count: { _all: true } }),
    prisma.contract.count({ where: { tenantId, status: 'ACTIVE' } }),
    prisma.invoice.count({
      where: { contract: { tenantId }, status: { in: ['UNPAID', 'OVERDUE'] } },
    }),
  ]);

  return {
    rentalRequests: toCountMap(requests, 'status', ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']),
    activeContracts,
    unpaidInvoices,
  };
};

const getOwnerDashboard = async (ownerId) => {
  const [properties, rooms, pendingRequests, activeContracts] = await Promise.all([
    prisma.property.count({ where: { ownerId } }),
    prisma.room.groupBy({ by: ['status'], where: { property: { ownerId } }, _count: { _all: true } }),
    prisma.rentalRequest.count({ where: { status: 'PENDING', room: { property: { ownerId } } } }),
    prisma.contract.count({ where: { ownerId, status: 'ACTIVE' } }),
  ]);

  const roomsByStatus = toCountMap(rooms, 'status', ['AVAILABLE', 'RENTED', 'HIDDEN']);

  return {
    properties,
    rooms: {
      total: Object.values(roomsByStatus).reduce((a, b) => a + b, 0),
      ...roomsByStatus,
    },
    pendingRequests,
    activeContracts,
  };
};

const getAdminDashboard = async () => {
  const [byRole, byStatus, properties, rooms, pendingPosts] = await Promise.all([
    prisma.user.groupBy({ by: ['role'], _count: { _all: true } }),
    prisma.user.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.property.count(),
    prisma.room.count(),
    prisma.post.count({ where: { status: 'PENDING' } }),
  ]);

  const roles = toCountMap(byRole, 'role', ['ADMIN', 'OWNER', 'TENANT']);

  return {
    users: {
      total: Object.values(roles).reduce((a, b) => a + b, 0),
      byRole: roles,
      byStatus: toCountMap(byStatus, 'status', ['ACTIVE', 'LOCKED']),
    },
    properties,
    rooms,
    pendingPosts,
  };
};

module.exports = { getTenantDashboard, getOwnerDashboard, getAdminDashboard };
