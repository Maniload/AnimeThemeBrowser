document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    let task;

    $(".next-button").click(function () {
        let theme = themes.splice(Math.random() * themes.length, 1)[0];

        let player = $("#player");
        player.attr("src", getPreferredSource(theme.versions[0].sources).url);

        clearInterval(task);
        let frame = 0;
        task = setInterval(function () {
            render(frame, theme);

            if (!$("#player").get(0).paused) {
                frame++;
            }

            if (frame >= 24 * 20) {
                clearInterval(task);
            }
        }, 1000 / 24);
    });

    function render(frame, theme) {
        // 10 second guessing time
        frame -= 24 * 10;

        if (frame < 0) {
            ctx.font = "100px Renogare";
            let counter = Math.floor(Math.abs(frame) / 24).toString();
            let counterBox = Object.assign(ctx.measureText(counter), { height: getTextHeight(ctx, counter) });
            let angle = (Math.abs(frame) / (24 * 10)) * (2 * Math.PI);

            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, 1920, 1080);

            ctx.fillStyle = "#FFFFFF";
            ctx.beginPath();
            ctx.arc(1920 / 2, 1080 / 2, 100, 0, angle);
            ctx.lineTo(1920 / 2 + Math.cos(angle) * 100, 1080 / 2 + Math.sin(angle) * 100);
            ctx.arc(1920 / 2, 1080 / 2, 150, angle, 0, true);
            ctx.closePath();
            ctx.fill();

            ctx.fillText(counter, 1920 / 2 - counterBox.width / 2, 1080 / 2 + counterBox.height / 2);
            return;
        }

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
        drawPillar(theme.series.season.string, "#37474F", x[3], 698 + 90, 60, "#FFFFFF", 32, 12);
        drawPillar(theme.series.title.toUpperCase(), "#FFFFFF", x[2], 698, 90, "#37474F");

        drawPillar(theme.typeString, "#37474F", x[5], 882 + 90, 60, "#FFFFFF", 32, 12);
        drawPillar(theme.title.toUpperCase(), "#FFFFFF", x[4], 882, 90, "#37474F");
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

    function getTextHeight(ctx, text = "T") {
        let dummyTextBox = ctx.measureText(text);
        return dummyTextBox.actualBoundingBoxAscent + dummyTextBox.actualBoundingBoxDescent;
    }

    function bezierEaseOut(x) {
        return 3 * (0.9) * Math.pow(1 - x, 2) * x + 3 * (1 - x) * Math.pow(x, 2) + (1) * Math.pow(x, 3);
    }

    // TODO: Make the user decide which tags he prefers (and save that in cookies or something)
    const preferredTags = [
        0, // NC
        2  // 1080
    ];

    function getPreferredSource(sources) {
        sources = sources.slice();
        sources.sort((a, b) =>
            preferredTags.filter((tag) => b.tags.find((testTag) => testTag.id === tag)).length -
            preferredTags.filter((tag) => a.tags.find((testTag) => testTag.id === tag)).length
        );
        return sources[0];
    }

});