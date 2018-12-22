const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Tag = new Schema({
    id: {
        type: Number,
        required: true
    }
}, {
    _id: false,
    toObject: {
        virtuals: true
    },
    toJSON: require("../util/api").toJSON
});

Tag
    .virtual("string")
    .get(function () {
        return getTagFromId(this.id);
    });

const Version = new Schema({
    index: {
        type: Number,
        required: true
    },
    sources: [
        {
            _id: false,
            url: {
                type: String,
                required: true
            },
            tags: [Tag]
        }
    ]
}, {
    _id: false,
    id: false,
    toObject: {
        virtuals: true
    },
    toJSON: require("../util/api").toJSON
});

Version
    .virtual("string")
    .get(function () {
        return "Version " + (this.index + 1);
    });

const Theme = new Schema({
    _id: {
        type: Number,
        default: function () {
            return (this.series & 0xFFFF) | ((this.type & 0x1) << 16) | ((this.index & 0xFF) << 17);
        }
    },
    series: {
        type: Number,
        ref: "series",
        default: function () {
            return this._id & 0xFFFF;
        }
    },
    type: {
        type: Number,
        default: function () {
            return (this._id >> 16) & 0x1;
        }
    },
    index: {
        type: Number,
        default: function () {
            return (this._id >> 17) & 0xFF;
        }
    },
    artist: Number,
    title: {
        type: String,
        required: true
    },
    versions: [Version]
}, {
    toObject: {
        virtuals: true
    },
    toJSON: require("../util/api").toJSON
});

Theme
    .virtual("typeString")
    .get(function () {
        return (this.type === 0 ? "OP" : "ED") + (this.index + 1);
    });

module.exports = mongoose.model("theme", Theme);

function getTagFromId(tagId) {
    switch (tagId) {
        case 0:
            return "NC";
        case 1:
            return "720";
        case 2:
            return "1080";
        case 3:
            return "Subbed";
        case 4:
            return "Lyrics";
    }
    return undefined;
}