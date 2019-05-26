const express = require('express');
const router = express.Router();

router.use('/users', require('./Users'));

module.exports = router;