$(window).resize(function () {

    let header = $("#header");
    let footer = $("#footer");
    $("body").css({
        "padding-top": header.outerHeight() + "px",
        "padding-bottom": footer.outerHeight() + "px"
    });

}).resize();