const express = require("express");
const router = express.Router();

const browseController = require("../controller/browseController");

// Renderable routes
router.get("/browse", browseController.browse.render);

// API routes
router.get("/api/browse", browseController.browse.api);

module.exports = router;