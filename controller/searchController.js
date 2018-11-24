const async = require("async");
const db = require("../db");

const Series = require("../models/series");

// exports.apiSearch = function (req, res) {
//
//     let limit = req.query.limit || 10;
//     let offset = req.query.offset || 0;
//     let query = req.query.query || null;
//     let order = validateOrder(req.query.order) || "asc";
//
//     search(limit, offset, query, order).then((data) => {
//         res.json(data);
//     }, (err) => {
//         console.log(err);
//         res.sendStatus(500);
//     });
//
// };

exports.search = function(query, callback) {
    if (query) {
        query = "%" + query + "%";
    }

    let limit = 30, offset = 0;

    async.waterfall([
        searchSeries,
        searchThemes
    ], callback);

    function searchSeries(callback) {
        let stmt = Series.query().leftJoin(Alias.table, function () {
            return this.using(db.knex.raw("(`anime_id`)"));
        });
        if (query) {
            stmt
                .where(Series.fields.title, "like", query)
                .orWhere(Alias.fields.alias, "like", query)
        }
        stmt
            .groupBy(Series.fields.id)
            .orderBy(Series.fields.title);

        async.parallel({
            part: (callback) => {
                async.waterfall([
                    function (callback) {
                        stmt
                            .clone()
                            .limit(limit)
                            .offset(offset)
                            .asCallback(callback);
                    },
                    function (rows, callback) {
                        async.map(rows, Series.build.bind(Series), callback);
                    }
                ], callback);
            },
            total: (callback) => {
                let temp = db.knex().from(stmt).count("*");

                console.log(temp.toString());

                temp.then(function (rows) {
                        return rows[0]["count(*)"];
                    })
                    .asCallback(callback);
            }
        }, callback);
    }

    function searchThemes(foundSeries, callback) {
        let foundThemes = [];

        if (foundSeries.part.length < 30) {

        }

        console.log(foundSeries.part);

        let temp;

        try {
            temp = {
                results: {
                    series: foundSeries.part,
                    themes: foundThemes
                },
                total: foundSeries.total
            };
        } catch (e) {
            console.log(e);
        }

        console.log(temp);

        callback(null, temp);
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