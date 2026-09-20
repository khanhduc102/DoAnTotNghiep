// Chuan hoa dinh dang tra ve cho toan bo API.
// Thanh cong: { success: true, message, data }
// That bai:   { success: false, message, errors }

const ok = (res, data = null, message = 'Thanh cong') =>
  res.status(200).json({ success: true, message, data });

const created = (res, data = null, message = 'Tao moi thanh cong') =>
  res.status(201).json({ success: true, message, data });

// Tra ve danh sach co phan trang
const paginated = (res, items, { page, limit, total }, message = 'Thanh cong') =>
  res.status(200).json({
    success: true,
    message,
    data: {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    },
  });

module.exports = { ok, created, paginated };
