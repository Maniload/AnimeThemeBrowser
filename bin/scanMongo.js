const async = require("async");
const jsdom = require("jsdom");
const request = require("request");

const mongoose = require("mongoose");

const Series = require("../models/series");
const Theme = require("../models/theme");

function scan() {
    // First we need to connect to MongoDB
    mongoose.connect("mongodb://localhost/anithemes");
    let db = mongoose.connection;
    db.on("error", console.error.bind(console, "MongoDB:"));
    db.once("open", (err) => {
        if (err) {
            console.error(err);
            return;
        }

        // Clean themes, because they change often and it's easier to just rescan all of them.
        // We keep the series and only insert ones that are not present in the database
        async.series([
            (callback) => Theme.deleteMany({}, callback)
        ], (err) => {
            if (err) {
                console.error(err);
                return;
            }

            // A list of year pages
            request("https://www.reddit.com/r/AnimeThemes/wiki/year_index", (err, res, body) => {
                let $ = require("jquery")(new jsdom.JSDOM(body).window);

                async.eachSeries($(".wiki h3 > a"), (anchor, callback) => {

                    let href = $(anchor).attr("href");

                    console.log(href);

                    // Scan a year page (one year page contains several seasons with series)
                    scanYear(href, callback);

                }, (err) => {

                    console.log("Finished scan!");

                });
            });
        });
    });
}

function scanYear(href, callback) {
    request("https://www.reddit.com" + href, (err, res, body) => {
        let $ = require("jquery")(new jsdom.JSDOM(body).window);

        let seasonHeaders = $(".wiki h2");

        let year = href.match(/\d+/)[0];
        let seasons = [];

        if (seasonHeaders.length) {
            // Mutiple seasons per page
            let i = 0;
            for (let seasonHeader of seasonHeaders) {
                seasonHeader = $(seasonHeader);

                console.log(seasonHeader.text());

                seasons.push({
                    year: year,
                    quarter: i++,
                    headers: seasonHeader.nextUntil(".wiki h2", ".wiki h3")
                });
            }
        } else {
            // One season per page (e.g. 90s)
            console.log("One season on page: " + href);

            seasons.push({
                year: year,
                quarter: -1,
                headers: $(".wiki h3")
            });
        }

        console.log("Found " + seasons.length + " season(s).");

        async.eachSeries(seasons, (season, callback) => scanSeason($, season, callback), callback);
    });
}

function scanSeason($, season, callback) {
    async.eachSeries(season.headers, (header, callback) => {
        let seriesId = $(header).find("a").attr("href").match(/\d+/)[0];

        console.log("Found series with id " + seriesId);

        async.series([
            (callback) => {
                // Add series to database if not already there
                Series.countDocuments({_id: seriesId}, function (err, count) {
                    if (!err && count === 0) {
                        let series = {
                            _id: seriesId,
                            title: $(header).find("a").text(),
                            aliases: (($(header).next().is("p") && $(header).next().has("strong").length) ? $(header).next().find("strong").text().split(", ") : []),
                            image: "Coming Soon",
                            members: 0,
                            score: 0.0,
                            season: {
                                year: season.year
                            }
                        };

                        if (season.quarter >= 0) {
                            series.season.quarter = season.quarter;
                        }

                        // Doing actual insert here
                        new Series(series).save((err) => {
                            if (err) {
                                console.error("Error while saving " + series.title);
                                console.error(err);
                            } else {
                                console.log("[SERIES] " + series.title);
                            }

                            callback();
                        });
                    } else {
                        callback();
                    }
                });
            },
            (callback) => {
                // Adding themes to database
                scanThemes($, header, seriesId, callback);
            }
        ], callback);
    }, callback);
}

function scanThemes($, header, seriesId, callback) {
    let tables = $(header).nextUntil("h3").filter("table");

    let themes = [];
    for (let table of tables) {
        let currentVersion;
        for (let row of $(table).find("tbody tr")) {
            let cells = $(row).find("td");
            let title = cells.eq(0).text();
            if (title) {
                let regex = /([A-Z]+)(?:(\d+))*(?: [vV](\d*))* "([^"]+)"/;
                let matches = title.match(regex);
                if (matches) {
                    let type;
                    switch (matches[1]) {
                        case "OP":
                            type = 0;
                            break;
                        case "ED":
                            type = 1;
                            break;
                    }
                    if (type === undefined) {
                        continue;
                    }

                    let index = (matches[2] || 1) - 1;
                    let version = (matches[3] || 1) - 1;
                    let title = matches[4];

                    if (themes[type] === undefined) {
                        themes[type] = [];
                    }

                    if (themes[type][index] === undefined) {
                        themes[type][index] = {
                            series: seriesId,
                            type: type,
                            index: index,
                            title: title,
                            versions: []
                        }
                    }

                    themes[type][index].versions.push(currentVersion = {
                        index: themes[type][index].versions.length,
                        sources: []
                    });
                } else {
                    // No matches
                    continue;
                }
            }
            let anchor = cells.eq(1).find("a");
            if (anchor.is("a")) {
                let url = anchor.attr("href");
                let tags = anchor.html().substring(anchor.html().indexOf("(") + 1, anchor.html().indexOf(")")).split(",");
                if (url) {
                    let source = {
                        url: url,
                        tags: []
                    };

                    for (let tag of tags) {
                        let tagId = getTagId(tag.trim());
                        if (tagId !== undefined) {
                            source.tags.push({
                                id: tagId
                            });
                        }
                    }

                    currentVersion.sources.push(source);
                }
            }
        }
    }

    themes = themes.reduce((themes, themeList) => themes.concat(themeList.filter((theme) => !!theme) || []), []);

    async.eachSeries(themes, (theme, callback) => {
        new Theme(theme).save((err) => {
            if (err) {
                console.error("Error while saving " + theme.title);
                console.error(err);
            } else {
                console.log("[THEME] " + theme.title);
            }

            callback();
        });
    }, callback);
}

function getTagId(tag) {
    switch (tag) {
        case "NC":
            return 0;
        case "720":
            return 1;
        case "1080":
            return 2;
        case "Subbed":
            return 3;
        case "Lyrics":
            return 4;
    }
    return undefined;
}

scan();
