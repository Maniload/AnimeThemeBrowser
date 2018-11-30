const async = require("async");
const pagination = require("../util/pagination");

const Series = require("../models/series");
const Theme = require("../models/theme");

exports.browse = function(req, res) {
    let query = req.query.query,
        limit = Math.min(Math.max(1, +(req.query.limit || 30))),
        offset = Math.max(+(req.query.offset || 0));

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

    let time = Date.now();

    async.waterfall([
        searchSeries,
        searchThemes
    ], (err, results) => {
        if (err) {
            console.error(err);
            res.sendStatus(500);
            return;
        }

        console.log("Took " + (Date.now() - time));

        res.render("browse", results);
    });

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
                                        .sort("type index")
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

    function searchThemes(foundSeries, callback) {
        let foundThemes = [];

        if (foundSeries.series.length < 30) {

        }

        callback(null, {
            results: {
                series: foundSeries.series,
                themes: foundThemes
            },
            pagination: pagination(limit, offset, foundSeries.total),
            query: query,
            pageTitle: "Browse"
        });
    }

    // if (mode === modes.MIXED || mode === modes.SERIES) {
    //     // Search series first, to order them above themes
    //     sql =
    //         "SELECT anime.* FROM anime " +
    //         "LEFT JOIN anime_alias USING (anime_id)";
    //     if (query) {
    //         sql += " WHERE anime_title LIKE ? OR alias LIKE ?";
    //     }
    //     sql += " GROUP BY anime_id ORDER BY anime_title " + order + " LIMIT ? OFFSET ?;";
    //
    //     let seriesList = await (query ? all(sql, query, query, limit, offset) : all(sql, limit, offset));
    //
    //     for (let series of seriesList) {
    //         // Include theme sample
    //         sql =
    //             "SELECT theme.* FROM theme " +
    //             "INNER JOIN anime USING (anime_id) " +
    //             "WHERE anime_id = ? ORDER BY theme_index, type LIMIT 2;";
    //
    //         let totalSql =
    //             "SELECT COUNT(*) AS total FROM theme " +
    //             "INNER JOIN anime USING (anime_id) " +
    //             "WHERE anime_id = ?;";
    //
    //         series.themes = {
    //             sample: await all(sql, series.anime_id),
    //             total: (await get(totalSql, series.anime_id)).total
    //         };
    //         series.themes.missing = Math.max(series.themes.total - 2, 0);
    //
    //         for (let themeSample of series.themes.sample) {
    //             await fetchTheme(themeSample);
    //         }
    //
    //         await fetchSeries(series);
    //     }
    //
    //     results.series = seriesList;
    // }
    // if ((mode === modes.MIXED || mode === modes.THEMES) && results.series.length < limit) {
    //     let sql =
    //         "SELECT * FROM theme " +
    //         "INNER JOIN anime USING (anime_id)";
    //     if (query) {
    //         sql += " WHERE theme_title LIKE ?";
    //     }
    //     sql += " ORDER BY theme_title " + order + " LIMIT ? OFFSET ?;";
    //
    //     let themeList = await (query ?
    //         all(sql, query, limit - results.series.length, offset) :
    //         all(sql, limit - results.series.length, offset)
    //     );
    //
    //     for (let theme of themeList) {
    //         await fetchTheme(theme);
    //     }
    //
    //     results.themes = themeList;
    // }
    //
    // // Get total search results
    // sql = "SELECT COUNT(*) AS total FROM theme";
    // if (query) {
    //     sql += " WHERE theme_title LIKE ?";
    // }
    // sql += ";";
    //
    // let total = (await (query ? get(sql, query) : get(sql))).total;
    //
    // sql =
    //     "SELECT COUNT(*) AS total FROM (" +
    //     "SELECT anime_id FROM anime " +
    //     "LEFT JOIN anime_alias USING (anime_id)";
    // if (query) {
    //     sql += " WHERE anime_title LIKE ? OR alias LIKE ?";
    // }
    // sql += " GROUP BY anime_id);";
    //
    // total += (await (query ? get(sql, query, query) : get(sql))).total;
    //
    // return {
    //     total: total,
    //     results: results
    // };
};