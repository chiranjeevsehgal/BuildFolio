const { getAllTemplates, getTemplate } = require("../controllers/templateController");
const auth = require("../middleware/auth");
const express = require('express');

const router = express.Router();

router.get('/templates', auth, getAllTemplates);
router.get('/templates/:templateId', auth, getTemplate);

module.exports = router;
