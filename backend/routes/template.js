const { getTemplates, getFeaturedTemplates, getTemplate, createTemplate, updateTemplate, deleteTemplate, incrementDownload, seedTemplates } = require("../controllers/templateController");
const auth = require("../middleware/auth");
const express = require('express');

const router = express.Router();

router.get('/', getTemplates);
router.get('/featured', getFeaturedTemplates);
router.get('/:id', getTemplate);
router.post('/', createTemplate);
router.put('/:id', updateTemplate);
router.delete('/:id', deleteTemplate);
router.post('/:id/download', incrementDownload);
router.post('/seed', seedTemplates);

module.exports = router;
