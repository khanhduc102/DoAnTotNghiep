// Nhom route chi danh cho OWNER. Quyen duoc chan 1 lan o cap nhom:
// moi route them vao file nay tu dong yeu cau dang nhap + role OWNER.
const express = require('express');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const dashboard = require('../modules/dashboard/dashboard.controller');

const router = express.Router();

router.use(authenticate, authorize('OWNER'));

router.get('/dashboard', dashboard.owner);

module.exports = router;
