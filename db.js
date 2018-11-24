const mongoose = require("mongoose");

exports.connect = function (callback) {
    mongoose.connect("mongodb://localhost/anithemes");
    let db = mongoose.connection;
    db.on("error", console.error.bind(console, "MongoDB:"));
    db.once("open", callback);
};