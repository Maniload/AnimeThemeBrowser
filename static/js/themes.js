const itemsPerPage = 30;

let currentPage = 0;

$(document).ready(function () {

    $(".page-previous").click(() => showPage(currentPage - 1));
    $(".page-next").click(() => showPage(currentPage + 1));

    $("#query-input").bind("input", () => showPage(0));
    $("#order-select").change(() => showPage(currentPage));

});

function showPage(page) {
    let themeList = $("#theme-list");
    let themeListNoResults = $("#theme-list-no-results");

    let query = $("#query-input").val();
    let order = $("#order-select").val().split("-");

    $.get("/api/themes?limit=" + itemsPerPage + "&offset=" + (page * itemsPerPage) + "&query=" + encodeURIComponent(query) + "&orderBy=" + order[0] + "&order=" + order[1], function (data) {

        themeList.find(".theme-list-result").remove();

        if (data.total > 0 && !themeListNoResults.hasClass("d-none")) {
            themeListNoResults.addClass("d-none");
        } else if (data.total === 0 && themeListNoResults.hasClass("d-none")) {
            themeListNoResults.removeClass("d-none");
        }

        for (let theme of data.part) {
            themeList.append(
                $("<a>", {
                    "class": "theme-list-result list-group-item list-group-item-action flex-column align-items-start",
                    href: "/watch/" + theme.theme_id
                }).append(
                    $("<img>", {
                        src: theme.image,
                        "class": "img-fluid rounded float-left mr-2 img-cover"
                    }),
                    $("<h5>", {
                        html: theme.theme_title,
                        "class": "mb-1"
                    }),
                    $("<div>", {
                        "class": "d-flex justify-content-between"
                    }).append(
                        $("<p>", {
                            html: theme.anime_title,
                            "class": "text-muted mb-1"
                        }),
                        $("<small>", {
                            html: theme.type_string
                        })
                    )
                )
            );

        }

        $(".page-label").html("Page " + (page + 1) + " of " + (Math.ceil(data.total / itemsPerPage) || 1));
        $(".page-previous").prop("disabled", page === 0);
        $(".page-next").prop("disabled", page === (Math.ceil(data.total / itemsPerPage) || 1) - 1);

        $("#theme-count").html((query ? " matching \"" + query + "\"" : "") + " (" + new Intl.NumberFormat().format(data.total) + ")");

    });

    currentPage = page;
}