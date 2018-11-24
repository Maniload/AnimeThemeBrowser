$(document).ready(function () {

    $("#quick-search").bind("input", () => {
        $("#quick-search-no-results").toggle(false);

        let query = $("#quick-search").val();
        if (query && query !== "") {
            $("#quick-search-placeholder").toggle(false);
            $.get("/api/themes?limit=5&query=" + encodeURIComponent(query) + "&orderBy=series&order=asc", function (data) {

                $(".quick-search-result").remove();

                if (data.total > 0) {
                    let results = $("#quick-search-results");
                    for (let result of data.part) {
                        results.append($("<a>", {
                            "class": "dropdown-item quick-search-result",
                            href: "/watch/" + result.theme_id
                        }).append(
                            $("<h6>", {
                                "class": "mb-0"
                            }).append(
                                $("<span>", {
                                    html: result.type_string,
                                    "class": "badge badge-secondary mr-1"
                                }),
                                result.theme_title
                            ),
                            $("<small>", {
                                html: result.anime_title,
                                "class": "text-muted"
                            })
                        ));
                    }
                    if (data.total > 5) {
                        results.append($("<h6>", {
                            html: (data.total - 5) + " more...",
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

});