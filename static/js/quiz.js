document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    let currentTheme;
    let nextTheme;

    $(".next-button").click(function () {
        let player = $("#player");
        let preloader = $("#player-preload");

        if (nextTheme) {
            currentTheme = nextTheme;

            player.attr("src", preloader.attr("src"));
        } else {
            currentTheme = getRandomTheme();

            player.attr("src", getPreferredSource(currentTheme.versions[0].sources).url);
            player.get(0).load();
        }

        player.on("canplay", () => player.get(0).play());

        nextTheme = getRandomTheme();

        preloader.attr("src", getPreferredSource(nextTheme.versions[0].sources).url);
        preloader.get(0).load();
    });

    $(".pause-button").click(function () {
        let domPlayer = $("#player").get(0);

        if (domPlayer.paused) {
            domPlayer.play();
        } else {
            domPlayer.pause();
        }
    });

    $(".fullscreen-button").click(() => toggleFullscreen($("#player-container").get(0)));

    $("#canvas").click(() => $("#player-controls").toggle());

    requestAnimationFrame(render);

    function render() {
        let domPlayer = $("#player").get(0);

        if (!domPlayer.paused && currentTheme) {
            ctx.drawImage(domPlayer, 0, 0, canvas.width, canvas.height);

            renderOverlay(Math.floor(domPlayer.currentTime * 24), currentTheme);
        }

        requestAnimationFrame(render);
    }

    function renderOverlay (frame, theme) {
        let guessTime = $("#guess-time-input").val();

        frame -= 24 * guessTime;

        if (frame < 0) {
            ctx.font = "100px Renogare";
            let counter = Math.floor(Math.abs(frame) / 24).toString();
            let counterBox = Object.assign(ctx.measureText(counter), { height: getTextHeight(ctx, 100, counter) });
            let angle = (Math.abs(frame) / (24 * guessTime)) * (2 * Math.PI);

            ctx.fillStyle = "#37474F";
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
        ctx.moveTo(x - 10, y);
        ctx.lineTo(x + rectWidth, y);
        ctx.arc(x + rectWidth, y + height / 2, height / 2, Math.PI / 2 * 3, Math.PI / 2);
        ctx.lineTo(x - 10, y + height);
        ctx.closePath();
        ctx.fill();

        ctx.shadowColor = "transparent";

        ctx.fillStyle = textFillStyle;
        ctx.fillText(text, x + paddingX, y + height / 2 + getTextHeight(ctx, (height - paddingY * 2)) / 2);
    }

    function getTextHeight(ctx, fallback, text = "T") {
        let dummyTextBox = ctx.measureText(text);

        // This is still a very experimantel API feature, but it gives great results
        if (dummyTextBox.actualBoundingBoxAscent !== undefined && dummyTextBox.actualBoundingBoxDescent !== undefined) {
            return dummyTextBox.actualBoundingBoxAscent + dummyTextBox.actualBoundingBoxDescent;
        }

        // Fallback should be the same as font size
        return fallback;
    }

    function bezierEaseOut(x) {
        return 3 * (0.9) * Math.pow(1 - x, 2) * x + 3 * (1 - x) * Math.pow(x, 2) + (1) * Math.pow(x, 3);
    }

    function getRandomTheme() {
        return themes.splice(Math.random() * themes.length, 1)[0];
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
    
    function toggleFullscreen(element) {
        let isInFullScreen = (document.fullscreenElement && document.fullscreenElement !== null) ||
            (document.webkitFullscreenElement && document.webkitFullscreenElement !== null) ||
            (document.mozFullScreenElement && document.mozFullScreenElement !== null) ||
            (document.msFullscreenElement && document.msFullscreenElement !== null);

        if (!isInFullScreen) {
            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if (element.webkitRequestFullScreen) {
                element.webkitRequestFullScreen();
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    }

});