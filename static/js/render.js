document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    let currentTheme, currentRank = 1, currentEntry;

    $(".render-button").click(function () {
        $("html, body").animate({
            scrollTop: 0
        }, 600);

        let rankingForm = $(".ranking-form.active");

        currentEntry = {
            series: rankingForm.find(".series-input").val(),
            seriesInfo: rankingForm.find(".series-info-input").val(),
            theme: rankingForm.find(".theme-input").val(),
            themeInfo: rankingForm.find(".theme-info-input").val(),
            rank: "#" + currentRank,
            rankInfo: rankingForm.find(".rank-info-input").val()
        };

        let player = $("#player");
        player.attr("src", rankingForm.find(".version-select").val());
        player.on("canplay", () => player.get(0).play());
        player.get(0).load();
    });

    $(".pause-button").click(function () {
        let domPlayer = $("#player").get(0);

        if (domPlayer.paused) {
            domPlayer.play();
        } else {
            domPlayer.pause();
        }
    });

    $(document).on("click", ".alias-select .dropdown-item", function () {
        let seriesInput = $(this).closest(".ranking-form").find(".series-input");
        seriesInput.val($(this).text());

        onChange.call(seriesInput);
    });

    $("#theme-select .dropdown-item").click(function () {
        let themeId = $(this).data("id");

        $(".ranking-form.active").removeClass("active").collapse("hide");

        let rankingForm = $("#ranking-form-" + themeId);
        rankingForm.addClass("active").collapse("show");

        currentTheme = rankingForm.data("info");

        let rankButton = $(".page-link[data-rank='" + currentRank + "']");

        rankButton.attr("theme", currentTheme.theme.id).removeClass("bg-secondary");
    });

    $("#rank-select").on("click", ".page-link", function () {
        let rankButton = $(this);
        currentRank = rankButton.data("rank");
        currentTheme = $("#ranking-form-" + rankButton.attr("theme")).data("info");

        $(".ranking-form.active").removeClass("active").collapse("hide");

        $("#ranking-entry-rank").text(rankButton.text());
    });

    $(document).on("hidden.bs.collapse", ".ranking-form", function () {
        if (currentTheme) {
            $("#ranking-form-" + currentTheme.theme.id).addClass("active").collapse("show");
        }
    });

    $(document).on("input", "input, select", onChange);

    function onChange() {
        let input = $(this);
        input.closest(".form-group").find(".mapping-info").text("Unsaved mapping change!");

        if (!input.hasClass("changed")) {
            input.addClass("changed");
        }
    }

    $(document).on("click", ".save-mappings-button", function () {
        let update = {};
        let form = $(this).closest(".ranking-form");

        for (let input of form.find("input.changed")) {
            update[$(input).attr("name")] = $(input).val();
        }

        if (form.find(".version-select.changed").length) {
            let option = form.find(".version-select option:checked");
            update.version = option.data("version");
            update.source = option.data("source");
        }

        if (Object.keys(update)) {
            $.ajax(
                "/api/playlist/" + $("#playlist-title").val() + "/" + form.data("info").theme.id + "/mappings",
                {
                    data: JSON.stringify(update),
                    dataType: "json",
                    contentType: "application/json; charset=utf-8",
                    method: "POST",
                    success: function () {
                        for (let input of form.find("input.changed, select.changed")) {
                            $(input).removeClass("changed").closest(".form-group").find(".mapping-info").text("Custom mapping");
                        }
                    }
                }
            );
        }
    });

    $("#save-button").click(function () {
        let ranking = {
            ranks: []
        };

        let titleInput = $("#ranking-title");
        if (titleInput.val()) {
            ranking.title = titleInput.val();
        }

        for (let rankButton of $(".page-link")) {
            let rank = $(rankButton).data("rank");
            let themeId = $(rankButton).attr("theme");

            if (themeId) {
                ranking.ranks.push({
                    rank: rank,
                    theme: themeId
                });
            }
        }

        $.ajax(
            "/api/playlist/" + $("#playlist-title").val() + "/rankings",
            {
                data: JSON.stringify(ranking),
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                method: "POST",
                success: function () {
                    window.alert("Ranking was saved succesfully!");
                }
            }
        );
    });

    initDiagram(ctx);

    // Preview rendering

    const frameRate = 60;

    requestAnimationFrame(render);

    function render() {
        let domPlayer = $("#player").get(0);

        if (!domPlayer.paused && currentEntry) {
            ctx.drawImage(domPlayer, 0, 0, canvas.width, canvas.height);

            renderOverlay(Math.floor(domPlayer.currentTime * frameRate), currentEntry);
        }

        requestAnimationFrame(render);
    }

    function renderOverlay(frame, entry) {
        let x = [0, 0, 0, 0, 0, 0];
        for (let i = 0; i < x.length; i++) {
            if (frame - i * 8 < frameRate) {
                x[i] = bezier((frame - i * 8) / frameRate, 1, 1) * 1920 - 1920;
            } else if (frame + i * 8 > frameRate * 11) {
                x[i] = -1920;
            } else if (frame + i * 8 > frameRate * 10) {
                x[i] = bezier(((frame + i * 8) - frameRate * 10) / frameRate, 0, 0) * -1920;
            }
        }

        // Draw shapes and text
        // if (entry.rankInfo) {
        //     drawPillar(entry.rankInfo, "#37474F", x[1], 54 + 270, 60, "#FFFFFF", 32, 12);
        // }

        renderDiagram(Math.max(0, Math.min(frame, 9 * frameRate)) - frameRate, ctx, x[1]);

        drawPillar(entry.rank, "#FFFFFF", x[0], 54, 270, "#37474F", 40, 35);

        drawPillar(entry.seriesInfo, "#37474F", x[3], 698 + 90, 60, "#FFFFFF", 32, 12);
        drawPillar(entry.series.toUpperCase(), "#FFFFFF", x[2], 698, 90, "#37474F");

        drawPillar(entry.themeInfo, "#37474F", x[5], 882 + 90, 60, "#FFFFFF", 32, 12);
        drawPillar(entry.theme.toUpperCase(), "#FFFFFF", x[4], 882, 90, "#37474F");
    }

    function drawPillar(text, textFillStyle, x, y, height, shapeFillStyle, paddingX = 40, paddingY = 20) {
        ctx.shadowColor = "rgba(0, 0, 0, 0.75)";
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = ctx.shadowOffsetY = 5;

        ctx.font = (height - paddingY * 2) + "px Renogare";
        let textBox = ctx.measureText(text);
        let rectWidth = textBox.width + paddingX;

        ctx.fillStyle = shapeFillStyle;
        ctx.beginPath();
        ctx.moveTo(x - 10, y);
        ctx.lineTo(x + rectWidth, y);
        ctx.arc(x + rectWidth, y + height / 2, height / 2, Math.PI / 2 * 3, Math.PI / 2);
        ctx.lineTo(x - 10, y + height);
        ctx.closePath();
        ctx.fill();

        ctx.shadowColor = "transparent";

        ctx.fillStyle = textFillStyle;
        ctx.fillText(text, x + paddingX, y + height / 2 + getTextHeight(ctx, height - paddingY * 2) / 2);
    }

    function getTextHeight(ctx, fallback) {
        let dummyTextBox = ctx.measureText("T");
        return (dummyTextBox.actualBoundingBoxAscent + dummyTextBox.actualBoundingBoxDescent) || fallback;
    }

    function bezier(t, y0 = 1 / 3, y1 = 2 / 3) {
        return 3 * (y0) * Math.pow(1 - t, 2) * t + 3 * y1 * (1 - t) * Math.pow(t, 2) + (1) * Math.pow(t, 3);
    }

});
