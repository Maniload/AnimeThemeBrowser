document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    let task;

    $(".render-button").click(function () {
        $("html, body").animate({
            scrollTop: 0
        }, 600);

        let container = $(this).parent().parent();
        let entry = {
            series: container.find(".series-input").val(),
            seriesInfo: container.find(".series-info-input").val(),
            theme: container.find(".theme-input").val(),
            themeInfo: container.find(".theme-info-input").val(),
            rank: "#" + container.find(".rank-input").val(),
            rankInfo: container.find(".rank-info-input").val()
        };

        let player = $("#player");
        player.attr("src", container.find(".url-input").val());
        player.on("canplay", function () {
            clearInterval(task);
            let frame = 0;
            task = setInterval(function () {
                render(frame, entry);

                if (!$("#player").get(0).paused) {
                    frame++;
                }

                if (frame >= 240) {
                    clearInterval(task);
                }
            }, 1000 / 24);
        });
    });

    $(".rank-submit").click(function () {
        let containers = $("#theme-list .card");
        let container = $(this).closest(".card");
        let rank = Math.max(container.find(".rank-input").val(), 1);

        // Make room for entry
        reserveRank(container, rank);

        // Re-order list
        containers.sort(function (a, b) {
            return $(a).attr("data-rank") - $(b).attr("data-rank");
        }).appendTo("#theme-list");

        // Remove gaps between ranks
        let indexRank = 1;
        containers.each(function() {
            updateRank($(this), indexRank++);
        });
    });

    $(".alias-select .dropdown-item").click(function () {
        $(this).closest(".input-group").find(".series-input").val($(this).text());
    });

    function render(frame, entry) {
        ctx.clearRect(0, 0, 1920, 1080);

        let x = [ 0, 0, 0, 0, 0, 0 ];
        for (let i = 0; i < x.length; i++) {
            if (frame - i * 4 < 24) {
                x[i] = bezierEaseOut((frame - i * 4) / 24) * 1920 - 1920;
            } else if (frame + i * 4 > 216) {
                x[i] = bezierEaseOut((240 - (frame + i * 4)) / 24) * 1920 - 1920;
            }
        }

        // Draw shapes and text
        if (entry.rankInfo) {
            drawPillar(entry.rankInfo, "#37474F", x[1], 54 + 270, 60, "#FFFFFF", 32, 12);
        }

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
        ctx.moveTo(x, y);
        ctx.lineTo(x + rectWidth, y);
        ctx.arc(x + rectWidth, y + height / 2, height / 2, Math.PI / 2 * 3, Math.PI / 2);
        ctx.lineTo(x, y + height);
        ctx.closePath();
        ctx.fill();

        ctx.shadowColor = "transparent";

        ctx.fillStyle = textFillStyle;
        ctx.fillText(text, x + paddingX, y + height / 2 + getTextHeight(ctx) / 2);
    }

    function getTextHeight(ctx) {
        let dummyTextBox = ctx.measureText("T");
        return dummyTextBox.actualBoundingBoxAscent + dummyTextBox.actualBoundingBoxDescent;
    }

    function bezierEaseOut(x) {
        return 3 * (0.9) * Math.pow(1 - x, 2) * x + 3 * (1 - x) * Math.pow(x, 2) + (1) * Math.pow(x, 3);
    }

    function reserveRank(element, rank) {
        let find;
        if ((find = $(".card[data-rank='" + rank + "']")).length) {
            reserveRank(find, rank + 1);
        }
        updateRank(element, rank);
    }

    function updateRank(element, rank) {
        element.attr("data-rank", rank);
        element.find(".rank-display").text("#" + rank);
        element.find(".rank-input").val(rank);
    }

});