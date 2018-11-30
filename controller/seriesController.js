const async = require("async");
const pagination = require("../util/pagination");

const Series = require("../models/series");
const Theme = require("../models/theme");

exports.list = {
    render: function (req, res) {
        fetchList(null, 30, 0, (err, results) => {
            if (err) {
                res.sendStatus(500);
                return;
            }

            res.render("series", {
                series: results.series,
                pagination: pagination(30, 0, results.total),
                pageTitle: "All Series"
            });
        });
    },
    api: function (req, res) {
        let
            query = req.query.query || null,
            limit = Math.min(req.query.limit || 30, 100),
            offset = +req.query.offset || 0;

        fetchList(query, limit, offset, (err, results) => {
            if (err) {
                console.error(err);
                res.sendStatus(500);
                return;
            }

            res.json({
                series: results.series,
                pagination: pagination(limit, offset, results.total)
            });
        });
    }
};

function fetchList(query, limit, offset, callback) {
    let queryDocument = query ? {
        $text: {
            $search: '"' + query + '"'
        }
    } : {};

    async.series({
        series: (callback) => {
            Series
                .find(queryDocument)
                .sort("title")
                .limit(limit)
                .skip(offset)
                .exec(callback);
        },
        total: (callback) => {
            Series
                .countDocuments(queryDocument, callback);
        }
    }, callback);
}

exports.detail = function (req, res, next) {
    fetchDetail(req.params.id, (err, series, themes) => {
        if (err) {
            res.sendStatus(500);
            return;
        } else if (!series) {
            // Series not found, 404
            next();
            return;
        }

        res.render("seriesDetail", Object.assign(series, {
            themes: themes,
            pageTitle: series.title
        }));
    });
};

function fetchDetail(id, callback) {
    async.waterfall([
        function (callback) {
            Series
                .findById(id, callback);
        },
        function (series, callback) {
            if (!series) {
                callback();
                return;
            }

            Theme
                .find({
                    "series": series._id
                })
                .sort("type index")
                .exec((err, themes) => callback(err, series, themes));
        }
    ], callback);
}