const themeApi = require("./themesController");

module.exports = {
    handle: function (req, res) {
        let body = req.body;

        if (body.theme_id) {
            if (!req.session.playlist) {
                req.session.playlist = [];
            } else {
                for (let theme of req.session.playlist) {
                    if (theme.theme_id === body.theme_id) {
                        res.sendStatus(409);

                        return;
                    }
                }
            }

            themeApi.fetchTheme(body.theme_id).then((theme) => {
                req.session.playlist.push(theme);

                res.json(theme);
            }, (err) => {
                console.log(err);
                res.sendStatus(400);
            });
        } else {
            res.sendStatus(400);
        }
    }
};