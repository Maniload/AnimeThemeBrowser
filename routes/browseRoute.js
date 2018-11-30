const express = require("express");
const router = express.Router();

const browseController = require("../controller/browseController");

router.get("/", browseController.browse);

module.exports = router;