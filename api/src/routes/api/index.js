const express = require('express');
const router = express.Router();

router.use('/auth', require('./Auth'));
router.use('/users', require('./Users'));
router.use('/addresses', require('./Addresses'));

module.exports = router;