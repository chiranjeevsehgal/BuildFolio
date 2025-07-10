const {
  getTemplates,
  getFeaturedTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  incrementDownload,
  seedTemplates,
} = require("../controllers/templateController");
const auth = require("../middleware/auth");
const express = require("express");

const router = express.Router();

router.get("/", auth, getTemplates);
router.get("/featured", auth, getFeaturedTemplates);
router.get("/:id", auth, getTemplate);
router.post("/", auth, auth.adminOnly, createTemplate);
router.put("/:id", auth, auth.adminOnly, updateTemplate);
router.delete("/:id", auth, auth.adminOnly, deleteTemplate);
router.post("/:id/download", auth, auth.adminOnly, incrementDownload);
router.post("/seed", auth, auth.adminOnly, seedTemplates);

module.exports = router;
