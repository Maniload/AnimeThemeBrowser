const express = require("express");
const router = express.Router();

const watchController = require("../controller/watchController");

router.get("/:id", watchController.watch);

module.exports = router;