const async = require("async");

const Theme = require("../models/theme");

/*
    TODO: Maybe extract this into a controller
 */

module.exports = function (req, res, next) {
    let themeId = Number(req.params.id);
    let versionId = Number(req.query.v || 0);
    let sourceId = Number(req.query.s || -1);

    async.waterfall([
        function (callback) {
            Theme.findById(themeId).populate("series").exec(callback);
        },
        function (theme, callback) {
            Theme.find({ series: theme.series }).sort("type index").exec((err, themes) => callback(err, theme, themes));
        }
    ], (err, theme, themes) => {

        if (err) {
            // Redirect to 404
            next();
            return;
        }

        theme = theme.toObject();
        themes = themes.map((otherTheme) => {
            return Object.assign(otherTheme.toObject(), {
                active: otherTheme.type === theme.type && otherTheme.index === theme.index
            })
        });

        let version = theme.versions.find((version) => version.index === versionId);

        if (sourceId < 0) {
            sourceId = version.sources.indexOf(getPreferredSource(req, version.sources));
        }

        let source = version.sources[sourceId];
        source.active = true;

        res.render("watch", {
            theme: theme,
            themes: themes,
            version: version,
            source: source,
            playlist: (req.session.playlist || []).map((theme) => Object.assign({
                active: theme.id === themeId
            }, theme)),
            pageTitle: theme.title
        });

    });
};

// TODO: Make the user decide which tags he prefers (and save that in cookies or something)
const preferredTags = [
    0, // NC
    2  // 1080
];

function getPreferredSource(req, sources) {
    sources = sources.slice();
    sources.sort((a, b) =>
        preferredTags.filter((tag) => b.tags.find((testTag) => testTag.id === tag)).length -
        preferredTags.filter((tag) => a.tags.find((testTag) => testTag.id === tag)).length
    );
    return sources[0];
}