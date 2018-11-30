const async = require("async");

const Series = require("../models/series");
const Theme = require("../models/theme");

module.exports = function (req, res) {

    Series
        .find()
        .sort("-members")
        .limit(100)
        .exec((err, series) => {
            if (err) {
                console.error(err);
                res.sendStatus(500);
                return;
            }

            async.concat(series, (series, callback) => {
                Theme.find({
                    series: series.id,
                    type: 0,
                    index: 0
                }).populate("series").exec(callback);
            }, (err, results) => {
                if (err) {
                    console.error(err);
                    res.sendStatus(500);
                    return;
                }

                res.render("quiz", {
                    themes: results
                });
            });
        });

};