const rest = require("../app.js");
const jsdom = require("jsdom");
const request = require("request");

module.exports = function (req, res) {
    let username = req.params.username;

    (async function(username) {

        let $ = require("jquery")(new jsdom.JSDOM(await downloadPage("https://myanimelist.net/animelist/" + username)).window);

        let animeList = JSON.parse($("table").eq(0).attr("data-items"));
        let animeIds = [];

        for (let anime of animeList) {
            if (anime.status === 2) {
                animeIds.push("'" + anime.anime_id + "'");
            }
        }

        let themes = await all(
            "SELECT * FROM theme " +
            "INNER JOIN anime USING (anime_id) " +
            "WHERE anime_id IN (" + animeIds.join(", ") + ")" +
            "ORDER BY anime_title, type, theme_index;");

        for (let theme of themes) {
            await fetchChildData(theme);
        }

        return themes;

    }(username)).then((data) => {
        res.render("mal-import", {
            username: username,
            themes: data,
            total_string: new Intl.NumberFormat().format(data.length)
        });
    }, (err) => {
        console.log(err);
        res.sendStatus(500);
    });
};

function downloadPage(url) {
    return new Promise((resolve => request(url, (error, response, body) => resolve(body))));
}

async function all(sql, ...bindings) {
    return await new Promise((resolve, reject) => rest.db.all(sql, bindings, (err, rows) => err ? reject(err) : resolve(rows)));
}

async function get(sql, ...bindings) {
    return await new Promise((resolve, reject) => rest.db.get(sql, bindings, (err, rows) => err ? reject(err) : resolve(rows)));
}

async function fetchChildData(theme) {
    theme.type_string = (theme.type === 0 ? "OP" : "ED") + (theme.theme_index + 1);
}