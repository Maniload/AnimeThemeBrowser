const express = require("express");
const router = express.Router();

const seriesController = require("../controller/seriesController");

// Renderable routes
router.get("/series", seriesController.list.render);
router.get("/series/:id", seriesController.detail);
router.get("/series/:id/:type/:index", (req, res) => {
    let theme = new require("../models/theme")({
        series: req.params.id,
        type: req.params.type,
        index: req.params.index
    });

    res.redirect("/watch/" + theme.id);
});

// API routes
router.get("/api/series", seriesController.list.api);

module.exports = router;