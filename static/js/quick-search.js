$(document).ready(function () {

    $("#quick-search").bind("input", () => {
        $("#quick-search-no-results").toggle(false);

        let query = $("#quick-search").val();
        if (query && query !== "") {
            $("#quick-search-placeholder").toggle(false);
            $.get("/api/browse?limit=5&query=" + encodeURIComponent(query), function (data) {

                $(".quick-search-result").remove();

                if (data.pagination.total > 0) {
                    let results = $("#quick-search-results");

                    for (let series of data.results.series) {
                        results.append(createSeriesElement(series));
                    }

                    for (let theme of data.results.themes) {
                        results.append(createThemeElement(theme));
                    }

                    if (data.pagination.total > 5) {
                        results.append($("<h6>", {
                            html: (data.pagination.total - 5) + " more...",
                            "class": "dropdown-header quick-search-result"
                        }));
                    }
                } else {
                    $("#quick-search-no-results").toggle(true);
                }

            });
        } else {
            $(".quick-search-result").remove();
            $("#quick-search-placeholder").toggle(true);
        }
    });

    function createSeriesElement(series) {
        return $("<a>", {
            "class": "dropdown-item quick-search-result",
            href: "/series/" + series.id
        }).append(
            $("<h6>", {
                "class": "mb-1 text-truncate d-block"
            }).append(
                $("<span>", {
                    html: "SERIES",
                    "class": "badge badge-secondary mr-1"
                }),
                series.title
            ),
            $("<small>", {
                html: series.aliasesString,
                "class": "text-muted text-truncate d-block"
            })
        );
    }

    function createThemeElement(theme) {
        return $("<a>", {
            "class": "dropdown-item quick-search-result",
            href: "/watch/" + theme.id
        }).append(
            $("<h6>", {
                "class": "mb-0"
            }).append(
                $("<span>", {
                    html: theme.typeString,
                    "class": "badge badge-secondary mr-1"
                }),
                theme.title
            ),
            $("<small>", {
                html: theme.series.title,
                "class": "text-muted"
            })
        );
    }

});