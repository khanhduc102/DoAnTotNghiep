// Nhom route chi danh cho TENANT. Quyen duoc chan 1 lan o cap nhom:
// moi route them vao file nay tu dong yeu cau dang nhap + role TENANT.
const express = require('express');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const dashboard = require('../modules/dashboard/dashboard.controller');

const router = express.Router();

router.use(authenticate, authorize('TENANT'));

router.get('/dashboard', dashboard.tenant);

module.exports = router;
