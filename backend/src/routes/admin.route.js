// Nhom route chi danh cho ADMIN. Quyen duoc chan 1 lan o cap nhom:
// moi route them vao file nay tu dong yeu cau dang nhap + role ADMIN.
const express = require('express');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const dashboard = require('../modules/dashboard/dashboard.controller');

const router = express.Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/dashboard', dashboard.admin);

module.exports = router;
