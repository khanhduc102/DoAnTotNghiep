// Gom tat ca route cua cac module. Module moi chi can them 1 dong o day.
const express = require('express');
const authRoute = require('../modules/auth/auth.route');

const router = express.Router();

router.use('/auth', authRoute);

module.exports = router;
