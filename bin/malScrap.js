const async = require("async");
const jsdom = require("jsdom");
const request = require("request");

const mongoose = require("mongoose");

const Series = require("../models/series");

start();

function start() {
    mongoose.connect("mongodb://localhost/anithemes");

    this.tasks = [];

    let saved = 0;
    let cursor = Series.find({ members: 0 }).cursor();
    let lastRequest;
    cursor.on("data", (series) => {

        this.tasks.push((callback) => {
            request("https://myanimelist.net/anime/" + series.id, (err, res, body) => {

                lastRequest = Date.now();

                if (err) {
                    callback(true);
                    return;
                } else if (!res || res.statusCode !== 200) {
                    callback(false);
                    return;
                }

                let $ = require("jquery")(new jsdom.JSDOM(body).window);

                series.image = $("meta[property='og:image']").attr("content");
                series.members = +$(".numbers.members strong").text().replace(/,/g, "");
                series.score = +$("[itemprop='ratingValue']").text();

                series.save((err) => {
                    if (err) {
                        console.error("Error in series " + series.title + " (" + series.id + ")");
                        console.error(err);
                        return;
                    }

                    console.log(++saved + " series updated!");
                });

                callback(false);

            });
        });

    });
    cursor.on("end", () => [

        async.whilst(() => this.tasks.length > 0, (callback) => {

            async.filterSeries(this.tasks, (task, callback) => {
                // Prevent rate limiting
                setTimeout(() => task((filter) => callback(null, filter)), lastRequest ? Math.max(0, 500 - (Date.now() - lastRequest)) : 0);
            }, (err, tasks) => {
                this.tasks = tasks;

                callback();
            });

        }, (err) => {
            if (err) {
                console.error(err);
                return;
            }

            console.log("FINISHED!");
        })

    ]);
}