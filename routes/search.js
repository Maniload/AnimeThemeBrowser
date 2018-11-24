const api = require("../controller/searchController");

module.exports = function (req, res) {
    api.search(req.query.query, (err, data) => {
        if (err) {
            console.log(err);
            res.sendStatus(500);
        } else {
            let params = {
                results: data.results,
                total_string: new Intl.NumberFormat().format(data.total),
                page: Number(req.query.page || 0),
                total_pages: Math.ceil(data.total / 30),
                has_next_page: data.total > 30,
                query: req.query.query
            };
            params.page_string = "Page " + (params.page + 1) + " of " + params.total_pages;
            params.previous_page = params.page - 1;
            params.next_page = params.page + 1;
            params.has_previous_page = params.page > 0;
            res.render("search", params);
        }

    });
};