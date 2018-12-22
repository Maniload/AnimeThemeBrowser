const express = require("express");
const router = express.Router();

const playlistController = require("../controller/playlistController");

// Renderable routes
router.get("/playlists", playlistController.list.render);
router.get("/playlist/:id", playlistController.detail.render);
router.get("/playlist/:id/ranking", playlistController.ranking.render);

// API routes
router.get("/api/playlists", playlistController.list.api.get);
router.post("/api/playlists", playlistController.list.api.post);
router.post("/api/playlist/:id", playlistController.detail.api.post);
router.post("/api/playlist/:id/:theme/mappings", playlistController.mappings.api.post);
router.post("/api/playlist/:id/rankings", playlistController.ranking.api.post);

module.exports = router;