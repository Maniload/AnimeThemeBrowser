$(document).ready(function () {

    $(".version-option").click(function () {

        let option = $(this);
        if (!option.hasClass("active")) {
            $(".version-option.active").removeClass("active");
            option.addClass("active");

            let data = JSON.parse(option.attr("data"));
            $("#player").attr("src", data.url);
            $("#version-display").html(data.version_list_index_string);
            $("#tag-display").html(data.tags.map(tag => $("<span>", {
                html: tag,
                "class": "badge badge-secondary ml-1"
            })));
        }

        return false;

    });

    let playlistAdd = $("#playlist-add");
    playlistAdd.click(function () {

        let themeId = Number($(this).attr("data"));

        $.post({
            url: "/api/playlist/test-playlist",
            data: JSON.stringify([ themeId ]),
            contentType: "application/json",
            success: function (theme) {
                // let playlist = $("#playlist");
                // if (!playlist.length) {
                //     $("#related-content").append(
                //         $("<h4>", {
                //             html: "Playlist:",
                //             "class": "mt-2"
                //         }),
                //         playlist = $("<div>", {
                //             id: "playlist",
                //             "class": "list-group"
                //         })
                //     );
                // }
                //
                // playlist.append(
                //     $("<a>", {
                //         "class": "list-group-item active"
                //     }).append(
                //         $("<div>", {
                //             html: theme.theme_title,
                //             "class": "text-truncate mr-1"
                //         }),
                //         $("<div>", {
                //             html: theme.anime_title,
                //             "class": "text.truncate text-muted"
                //         })
                //     )
                // );

                playlistAdd.popover({
                    title: "Success!",
                    content: "Added to playlist.",
                    trigger: "focus",
                    placement: "left"
                });
                playlistAdd.popover("show");
            },
            statusCode: {
                409: function () {
                    playlistAdd.popover({
                        title: "Failed!",
                        content: "Already in playlist.",
                        trigger: "focus",
                        placement: "left"
                    });
                    playlistAdd.popover("show");
                }
            }
        });

        return false;

    });

});