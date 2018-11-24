const itemsPerPage = 30;

let currentPage = 0;

$(document).ready(function () {

    $(".page-previous").click(() => showPage(currentPage - 1));
    $(".page-next").click(() => showPage(currentPage + 1));

    $("#query-input").bind("input", () => showPage(0));
    $("#order-select").change(() => showPage(currentPage));

});

function showPage(page) {
    let themeList = $("#series-list");

    let query = $("#query-input").val();
    let order = $("#order-select").val().split("-");

    $.get("/api/series?limit=" + itemsPerPage + "&offset=" + (page * itemsPerPage) + "&query=" + encodeURIComponent(query) + "&orderBy=" + order[0] + "&order=" + order[1], async function (data) {

        themeList.empty();

        for (let anime of data.part) {
            themeList.append(
                $("<a>", {
                    "class": "list-group-item list-group-item-action flex-column align-items-start",
                    href: "/series/" + anime.anime_id
                }).append(
                    $("<img>", {
                        src: anime.image,
                        "class": "img-fluid rounded float-left mr-2 img-cover"
                    }),
                    $("<div>", {
                        "class": "d-flex justify-content-between"
                    }).append(
                        $("<h5>", {
                            html: anime.anime_title,
                            "class": "mb-1"
                        }),
                        $("<small>", {
                            html: anime.season_string
                        })
                    ),
                    $("<p>", {
                        "class": "text-muted mb-1",
                        html: anime.aliases_string
                    })
                )
            );

        }

        $(".page-label").html("Page " + (page + 1) + " of " + (Math.ceil(data.total / itemsPerPage) || 1));
        $(".page-previous").prop("disabled", page === 0);
        $(".page-next").prop("disabled", page === (Math.ceil(data.total / itemsPerPage) || 1) - 1);

        $("#series-count").html((query ? " matching \"" + query + "\"" : "") + " (" + new Intl.NumberFormat().format(data.total) + ")");

    });

    currentPage = page;
}