$(window).resize(function () {

    let header = $("#header");
    let footer = $("#footer");
    $("body").css({
        "padding-top": header.outerHeight() + "px",
        "padding-bottom": footer.outerHeight() + "px"
    });

    // Enable bootstrap tooltips
    $('[data-toggle="tooltip"]').tooltip();

}).resize();