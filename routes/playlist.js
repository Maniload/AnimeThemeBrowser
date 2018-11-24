module.exports = function (req, res) {
    let rank = 1;
    res.render("playlist", {
        themes: req.session.playlist.slice().map((theme) => Object.assign({
            rank: rank++
        }, theme))
    });
};