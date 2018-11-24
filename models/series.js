const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Series = new Schema({
    _id: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    season: {
        year: {
            type: Number,
            required: true
        },
        quarter: Number
    },
    aliases: [String]
}, {
    toObject: {
        virtuals: true
    },
    toJSON: require("../util/api").toJSON
});

Series
    .virtual("season.string")
    .get(function () {
        return this.season.quarter >= 0 ?
            getQuarterString(this.season.quarter) + " " + this.season.year :
            (this.season.year < 100 ? this.season.year + "s" : this.season.year);
    });

Series
    .virtual("aliasesString")
    .get(function () {
        return this.aliases.join(", ");
    });

module.exports = mongoose.model("series", Series);

// TODO: Wrong order, fix scanner
function getQuarterString(quarter) {
    switch (quarter) {
        case 0:
            return "Fall";
        case 1:
            return "Summer";
        case 2:
            return "Spring";
        case 3:
            return "Winter";
    }
}