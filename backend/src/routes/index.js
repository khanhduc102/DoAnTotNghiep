// Gom tat ca route cua cac module. Module moi chi can them 1 dong o day.
const express = require('express');
const authRoute = require('../modules/auth/auth.route');
const tenantRoute = require('./tenant.route');
const ownerRoute = require('./owner.route');
const adminRoute = require('./admin.route');

const router = express.Router();

router.use('/auth', authRoute);

// Moi nhom tu chan quyen o cap nhom (xem tung file)
router.use('/tenant', tenantRoute);
router.use('/owner', ownerRoute);
router.use('/admin', adminRoute);

module.exports = router;
