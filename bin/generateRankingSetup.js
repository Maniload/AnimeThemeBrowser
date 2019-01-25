const mongoose = require("mongoose");

require("../models/series");
require("../models/theme");
const Playlist = require("../models/playlist");

mongoose.connect("mongodb://localhost/anithemes");
let db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB:"));
db.once("open", function (err) {
    if (err) {
        console.error(err);
        return;
    }

    Playlist
        .findOne()
        .populate({
            path: "themes.theme",
            populate: {
                path: "series"
            }
        })
        .exec(function (err, playlist) {
            if (err) {
                console.error(err);
                return;
            }

            let ranking = playlist.rankings[playlist.rankings.length - 1];
            let entries = [];

            for (let rank of ranking.ranks) {
                let item = playlist.themes.find((theme) => theme.theme._id === rank.theme);
                let mappings = item.mappings, theme = item.theme;
                entries.push({
                    series: mappings.seriesTitle || theme.series.title,
                    seriesInfo: mappings.seriesInfo || theme.series.season.string,
                    theme: mappings.themeTitle || theme.title,
                    themeInfo: mappings.themeInfo || theme.typeString,
                    rank: rank.rank,
                    rankInfo: mappings.rankInfo,
                    file: theme.versions.find((version) => version.index === mappings.version).sources[mappings.source].url
                });
            }

            process.stdout.write(JSON.stringify(entries));
            
            process.exit();
        });

});