const express = require("express");
const handlebars = require("express-handlebars");
const app = express();
const port = 3000;

require("./db").connect(() => {

    app.engine("hbs", handlebars({
        defaultLayout: "default",
        extname: ".hbs",
        helpers: {
            json: function (context) {
                return JSON.stringify(context);
            }
        }
    }));

    app.set("view engine", "hbs");
    app.set("views", "views");
    app.set("json spaces", 2);

    app.use(express.static("static"));
    app.use(express.static("vendor"));
    app.use(require("body-parser").json());

    // Routes
    app.get("/", (req, res) => res.render("home"));
    // app.get("/search", require("./routes/search"));
    app.use("/", require("./routes/seriesRoute"));
    app.get("/watch/:id", require("./routes/watchRoute"));
    // app.get("/mal/:username", require("./routes/mal-import"));
    // app.get("/playlist", require("./routes/playlist"));

    // 404 handler
    app.use(function (req, res) {
        res.render("error", {
            code: 404,
            message: "Page not found.",
            pageTitle: "404"
        });
    });

    app.listen(port);

});