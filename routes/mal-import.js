const async = require("async");
const jsdom = require("jsdom");
const request = require("request");

const Series = require("../models/series");
const Theme = require("../models/theme");

module.exports = function (req, res, next) {
    let username = req.params.username;

    console.log("Fetching MAL list for: " + username);

    let offset = 0;
    let animeIds = [];

    async.doWhilst((callback) => {
        request("https://myanimelist.net/animelist/" + username + "/load.json?status=2&offset=" + offset, (err, _, body) => {
            if (err) {
                callback(404);
                return;
            }

            let animeList = JSON.parse(body);

            if (!animeList || !(animeList instanceof Array)) {
                callback(404);
                return;
            }

            offset += animeList.length;

            for (let anime of animeList) {
                animeIds.push(anime.anime_id);
            }

            callback(null, animeList);
        });
    }, (animeList) => animeList.length, (err) => {
        if (err) {
            console.error(err);

            if (err === 404) {
                next();
            } else {
                res.sendStatus(500);
            }

            return;
        }

        async.concat(animeIds, (animeId, callback) => {
            async.parallel({
                series: (callback) => Series.findById(animeId, callback),
                themes: (callback) => {
                    Theme
                        .find({
                            series: animeId
                        })
                        .sort("type index")
                        .exec(callback);
                }
            }, callback);
        }, (err, results) => {
            if (err) {
                console.error(err);
                res.sendStatus(500);
                return;
            }

            results = results.filter((result) => result.series);

            res.render("mal-import", {
                username: username,
                results: results,
                totalString: new Intl.NumberFormat().format(results.reduce((acc, result) => acc + result.themes.length, 0))
            });
        });
    });
};