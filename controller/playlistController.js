const async = require("async");

const Playlist = require("../models/playlist");
const Theme = require("../models/theme");

exports.list = {
    render: function(req, res) {
        Playlist
            .find()
            .exec((err, playlists) => {
                if (err) {
                    console.log(err);
                    res.sendStatus(500);
                    return;
                }

                res.render("playlist", {
                    playlists: playlists
                });
            });
    },
    api: {
        get: function(req, res) {
            Playlist
                .find()
                .exec((err, playlists) => {
                    if (err) {
                        console.log(err);
                        res.sendStatus(500);
                        return;
                    }

                    res.json(playlists);
                });
        },
        post: function (req, res) {
            req.body.themes = req.body.themes.map((themeId) => ({ theme: themeId }));

            let playlist = new Playlist(req.body);

            async.waterfall([
                (callback) => playlist.save(callback),
                (playlist, callback) => playlist.populate({
                    path: "themes.theme",
                    populate: {
                        path: "series"
                    }
                }, callback)
            ], (err, playlist) => {
                if (err) {
                    res.status(400).send(err);
                    return;
                }

                res.json(playlist);
            });
        }
    }
};

exports.detail = {
    render: function (req, res) {
        Playlist
            .findById(req.params.id)
            .populate({
                path: "themes.theme",
                populate: {
                    path: "series"
                }
            })
            .exec((err, playlist) => {
                if (err) {
                    console.log(err);
                    res.sendStatus(500);
                    return;
                }

                res.render("playlistDetail", playlist);
            });
    },
    api: {
        get: function (req, res) {

        },
        post: function (req, res) {
            let id = req.params.id;
            let themes = req.body;

            Playlist
                .findByIdAndUpdate(id, {
                    $push: {
                        themes: {
                            $each: themes.map((themeId) => ({ theme: themeId }))
                        }
                    }
                }, { new: true })
                .exec((err, playlist) => {
                    if (err) {
                        console.log(err);
                        res.status(400).send(err);
                        return;
                    }

                    res.json(playlist);
                });
        },
        options: function (req, res) {

        }
    }
};

exports.ranking = {
    render: function (req, res) {
        Playlist
            .findById(req.params.id)
            .populate({
                path: "themes.theme",
                populate: {
                    path: "series"
                }
            })
            .exec((err, playlist) => {
                if (err) {
                    console.log(err);
                    res.sendStatus(500);
                    return;
                }

                let themes = playlist.themes;
                let pages = [];
                let rank = 1;

                for (let i = 0; i < Math.ceil(themes.length / 20); i++) {
                    pages.push(themes.slice(i * 20, Math.min((i + 1) * 20, themes.length)).map((theme) => Object.assign(theme, { rank: rank++ })));
                }

                res.render("rankingBuilder", {
                    playlist: playlist,
                    pages: pages
                });
            });
    },
    api: {
        post: function (req, res) {
            let id = req.params.id;
            let ranking = req.body;

            Playlist
                .findByIdAndUpdate(id, {
                    $push: {
                        rankings: ranking
                    }
                }, { new: true })
                .exec((err, playlist) => {
                    if (err) {
                        console.log(err);
                        res.status(400).send(err);
                        return;
                    }

                    res.json(playlist);
                });
        }
    }
};

exports.mappings = {
    api: {
        post: function (req, res) {
            let id = req.params.id;
            let themeId = req.params.theme;

            let body = req.body;
            let setter = {};

            console.log(body);

            for (let key in body) {
                if (body.hasOwnProperty(key)) {
                    setter["themes.$.mappings." + key] = body[key];
                }
            }

            console.log(setter);

            Playlist
                .findOneAndUpdate({
                    _id: id,
                    "themes.theme": themeId
                }, {
                    $set: setter
                }, { new: true })
                .exec((err, playlist) => {
                    if (err) {
                        console.log(err);
                        res.status(400).send(err);
                        return;
                    }

                    res.json(playlist);
                });
        }
    }
};