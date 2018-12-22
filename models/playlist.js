const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Ranking = new Schema({
    title: String,
    ranks: [{
        _id: false,
        rank: {
            type: Number,
            required: true
        },
        theme: {
            type: Number,
            required: true
        }
    }]
}, {
    _id: false,
    toObject: {
        virtuals: true
    },
    toJSON: require("../util/api").toJSON
});

const PlaylistTheme = new Schema({
    theme: {
        type: Number,
        ref: "theme",
        required: true
    },
    mappings: {
        seriesTitle: String,
        seriesInfo: String,
        themeTitle: String,
        themeInfo: String,
        rankInfo: {
            type: String,
            default: function () {
                return "Newcomer";
            }
        },
        version: {
            type: Number,
            default: 0
        },
        source: {
            type: Number,
            default: 0
        }
    }
}, {
    _id: false,
    id: false,
    toObject: {
        virtuals: true
    },
    toJSON: require("../util/api").toJSON
});

const Playlist = new Schema({
    _id: {
        type: String,
        required: true,
        match: [/^[a-z0-9-_]+$/, "Playlist title must consist of lowercase alphanumeric characters."],
        alias: "title"
    },
    themes: [PlaylistTheme],
    rankings: [Ranking]
}, {
    toObject: {
        virtuals: true
    },
    toJSON: require("../util/api").toJSON
});

Playlist
    .path("themes")
    .validate(
        (v) => v !== null && v.length > 0,
        "There must be at least one theme to create a playlist."
    );

module.exports = mongoose.model("playlist", Playlist);