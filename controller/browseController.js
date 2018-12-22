const async = require("async");
const pagination = require("../util/pagination");

const Series = require("../models/series");
const Theme = require("../models/theme");

exports.browse = {
    render: function(req, res) {
        let query = req.query.query,
            limit = Math.min(Math.max(1, +(req.query.limit || 30))),
            offset = Math.max(+(req.query.offset || 0));

        search(query, limit, offset, (err, results) => {
            if (err) {
                console.error(err);
                res.sendStatus(500);
                return;
            }

            res.render("browse", {
                results: {
                    series: results.series,
                    themes: results.themes
                },
                pagination: pagination(limit, offset, results.total),
                query: query,
                pageTitle: "Browse"
            });
        });
    },
    api: function (req, res) {
        let query = req.query.query,
            limit = Math.min(Math.max(1, +(req.query.limit || 30))),
            offset = Math.max(+(req.query.offset || 0));

        search(query, limit, offset, (err, results) => {
            if (err) {
                console.error(err);
                res.status(400).send(err);
                return;
            }

            res.json({
                results: {
                    series: results.series,
                    themes: results.themes
                },
                pagination: pagination(limit, offset, results.total)
            });
        });
    }
};

function search(query, limit, offset, callback) {
    let queryDocument = query ? {
        $or: [
            {
                title: {
                    $regex: new RegExp(".*\\Q" + query + "\\E.*"),
                    $options: "i"
                }
            },
            {
                aliases: {
                    $regex: new RegExp(".*\\Q" + query + "\\E.*"),
                    $options: "i"
                }
            }
        ]
    } : {};

    async.waterfall([
        searchSeries,
        searchThemes
    ], callback);

    function searchSeries(callback) {
        async.parallel({
            series: (callback) => {
                async.waterfall([
                    (callback) => {
                        Series
                            .find(queryDocument)
                            .limit(limit)
                            .skip(offset)
                            .sort("title")
                            .exec(callback);
                    },
                    (series, callback) => {
                        async.map(series, (series, callback) => {
                            async.parallel({
                                sample: (callback) => {
                                    Theme
                                        .find({
                                            series: series.id
                                        })
                                        .limit(2)
                                        .sort("index type")
                                        .exec(callback);
                                },
                                total: (callback) => {
                                    Theme.countDocuments({
                                        series: series.id
                                    }, callback);
                                }
                            }, (err, themes) => {
                                themes.missing = Math.max(0, themes.total - 2);
                                series.themes = themes;
                                callback(err, series);
                            });
                        }, callback);
                    }
                ], callback);
            },
            total: (callback) => {
                Series.countDocuments(queryDocument, callback);
            }
        }, callback);
    }

    function searchThemes(seriesResults, callback) {
        async.waterfall([
            (callback) => async.parallel({
                themes: (callback) => {
                    if (seriesResults.series.length < limit) {
                        Theme
                            .find(queryDocument)
                            .limit(limit - seriesResults.series.length)
                            .skip(offset - seriesResults.total + seriesResults.series.length)
                            .sort("title")
                            .populate("series")
                            .exec(callback);
                    } else {
                        callback(null, []);
                    }
                },
                total: (callback) => {
                    Theme.countDocuments(queryDocument, callback);
                }
            }, callback),
            (themeResults, callback) => callback(null, {
                series: seriesResults.series,
                themes: themeResults.themes,
                total: seriesResults.total + themeResults.total
            })
        ], callback);
    }
}