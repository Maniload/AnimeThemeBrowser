const async = require("async");
const jsdom = require("jsdom");
const request = require("request");

const Series = require("../models/series");
const Theme = require("../models/theme");

module.exports = function (req, res) {
    let username = req.params.username;

    request("https://myanimelist.net/animelist/" + username, (err, _, body) => {
        if (err) {
            console.error(err);
            res.sendStatus(500);
            return;
        }

        let $ = require("jquery")(new jsdom.JSDOM(body).window);

        let animeList = JSON.parse($("table").eq(0).attr("data-items"));
        let animeIds = [];

        // Only include completed (status = 2) animes
        for (let anime of animeList) {
            if (anime.status === 2) {
                animeIds.push(anime.anime_id);
            }
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