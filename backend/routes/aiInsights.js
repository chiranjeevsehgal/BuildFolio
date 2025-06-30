const express = require('express');
const router = express.Router();
const { uploadMiddleware, AIInsightsController } = require('../controllers/aiInsightsController');
const auth = require('../middleware/auth');

router.post('/analyze-resume', auth, uploadMiddleware, AIInsightsController.analyzeResume);
router.get('/analyze-job/:jobId', auth, AIInsightsController.analyzeJobDescription);

module.exports = router;