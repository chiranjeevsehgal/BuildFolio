const express = require('express');
const router = express.Router();
const { adminOnly } = require('../middleware/auth');
const auth = require('../middleware/auth');
const { getAllUsers } = require('../controllers/adminController');

router.get('/users', auth, adminOnly, getAllUsers);

module.exports = router;