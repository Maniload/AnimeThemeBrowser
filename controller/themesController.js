const rest = require("../app.js");
const seriesApi = require("./seriesController.js");

module.exports = {
    handle: function (req, res) {
        let limit = req.query.limit || 10;
        let offset = req.query.offset || 0;
        let query = req.query.query || null;
        let orderBy = validateOrderBy(req.query.orderBy) || "theme_title";
        let order = validateOrder(req.query.order) || "asc";

        fetchThemeList(limit, offset, query, orderBy, order).then((data) => {
            res.json(data);
        }, (err) => {
            console.log(err);
            res.sendStatus(500);
        });
    },
    fetchThemeList: fetchThemeList,
    fetchThemeListBySeries: fetchThemeListBySeries,
    fetchTheme: fetchTheme
};

async function fetchThemeList(limit, offset, query, orderBy, order) {
    query = query ? ("%" + query + "%") : query;

    // Get all results
    let sql =
        "SELECT * FROM theme " +
        "LEFT JOIN anime USING (anime_id) " +
        "LEFT JOIN anime_alias USING (anime_id)";
    if (query) {
        sql += " WHERE theme_title LIKE ? OR anime_title LIKE ? OR alias LIKE ?";
    }
    sql += " GROUP BY theme_id " + getOrderClause(orderBy, order) + " LIMIT ? OFFSET ?;";

    let themes = await (query ? all(sql, query, query, query, limit, offset) : all(sql, limit, offset));

    // Fetch child data
    for (let theme of themes) {
        await includeFormats(theme);
        seriesApi.includeFormats(theme);
    }

    // Get total search results
    sql =
        "SELECT COUNT(*) AS total FROM (" +
        "SELECT * FROM theme " +
        "LEFT JOIN anime USING (anime_id) " +
        "LEFT JOIN anime_alias USING (anime_id)";
    if (query) {
        sql += " WHERE theme_title LIKE ? OR anime_title LIKE ? OR alias LIKE ?";
    }
    sql += " GROUP BY theme_id);";

    let total = (await (query ? get(sql, query, query, query) : get(sql))).total;

    return {
        total: total,
        limit: limit,
        offset: offset,
        part: themes
    };
}

async function fetchThemeListBySeries(id) {
    let sql =
        "SELECT * FROM theme " +
        "LEFT JOIN anime USING (anime_id) " +
        "WHERE anime_id = ? " +
        "GROUP BY theme_id " + getOrderClause("series", "asc") + ";";

    let themes = await all(sql, id);

    for (let theme of themes) {
        await includeFormats(theme);
        seriesApi.includeFormats(theme);
    }

    return themes;
}

async function fetchTheme(id) {
    let sql = "SELECT * FROM source " +
        "INNER JOIN theme_version USING (theme_version_id)" +
        "INNER JOIN theme USING (theme_id)" +
        "INNER JOIN anime USING (anime_id)" +
        "WHERE theme_id = ?;";

    let theme = (await all(sql, id))[0];

    includeFormats(theme);
    await seriesApi.fetchChildData(theme);
    seriesApi.includeFormats(theme);

    return theme;
}

function includeFormats(theme) {
    theme.type_string = (theme.type === 0 ? "OP" : "ED") + (theme.theme_index + 1);
}

async function all(sql, ...bindings) {
    return await new Promise((resolve, reject) => rest.db.all(sql, bindings, (err, rows) => err ? reject(err) : resolve(rows)));
}

async function get(sql, ...bindings) {
    return await new Promise((resolve, reject) => rest.db.get(sql, bindings, (err, rows) => err ? reject(err) : resolve(rows)));
}

function getOrderClause(orderBy, order) {
    if (orderBy === "series") {
        return "ORDER BY anime_title " + order + ", type, theme_index";
    }
    return "ORDER BY " + orderBy + " " + order;
}

function validateOrderBy(orderBy) {
    switch (orderBy.toLowerCase()) {
        case "theme_title":
        case "series":
            return orderBy;
    }
    return false;
}

function validateOrder(order) {
    switch (order.toLowerCase()) {
        case "asc":
        case "desc":
            return order;
    }
    return false;
}