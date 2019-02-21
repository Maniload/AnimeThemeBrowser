let padding = 30;
let diagram = {
    x: 0,
    y: 54 + 270,
    width: 250,
    height: 250,
    cornerRadius: padding,
    axis: {
        x: {
            from: 0,
            to: 4,
            step: 1
        },
        y: {
            from: 0,
            to: 75,
            step: 10
        }
    },
    points: [
        {
            x: 0,
            y: 10
        },
        {
            x: 1,
            y: 5
        },
        {
            x: 2,
            y: 35
        },
        {
            x: 3,
            y: 75
        }
    ]
};

function initDiagram(context) {
    context.fillRoundRect = function (x, y, width, height, radius) {
        this.beginPath();
        this.moveTo(x, y);
        // this.arc(x + radius, y + radius, radius, -Math.PI, -Math.PI / 2);
        this.lineTo(x + width - radius, y);
        this.arc(x + width - radius, y + radius, radius, -Math.PI / 2, 0);
        this.lineTo(x + width, y + height - radius);
        this.arc(x + width - radius, y + height - radius, radius, 0, Math.PI / 2);
        this.lineTo(x, y + height);
        // this.lineTo(x + radius, y + height);
        // this.arc(x + radius, y + height - radius, radius, Math.PI / 2, Math.PI);
        this.closePath();
        this.fill();
    };

    context.drawLine = function (fromX, fromY, toX, toY) {
        this.beginPath();
        this.moveTo(fromX, fromY);
        this.lineTo(toX, toY);
        this.stroke();
    };
}

function renderDiagram(frame, context, x = 0, y = 0) {
    x += diagram.x;
    y += diagram.y;

    context.shadowColor = "rgba(0, 0, 0, 0.75)";
    context.shadowBlur = 15;
    context.shadowOffsetX = context.shadowOffsetY = 5;

    // Container
    context.fillStyle = "#FFFFFF";
    context.fillRoundRect(x, diagram.y, diagram.width, diagram.height, diagram.cornerRadius);

    context.shadowColor = "transparent";

    // Axis lines
    context.strokeStyle = "#CCCCCC";
    context.lineWidth = 3;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.beginPath();
    context.moveTo(x + padding, diagram.y + padding);
    context.lineTo(x + padding, diagram.y + diagram.height - padding);
    context.lineTo(x + diagram.width - padding, diagram.y + diagram.height - padding);
    context.stroke();

    // Axis dots (x)
    for (let xDot = diagram.axis.x.from; xDot < diagram.axis.x.to; xDot += diagram.axis.x.step) {
        context.beginPath();
        context.moveTo(x + padding + xDot * ((diagram.width - padding * 2) / (diagram.axis.x.to - diagram.axis.x.from - 1)), diagram.y + diagram.height - padding);
        context.lineTo(x + padding + xDot * ((diagram.width - padding * 2) / (diagram.axis.x.to - diagram.axis.x.from - 1)), diagram.y + diagram.height - padding - 2);
        context.stroke();
    }

    // Axis dots (y)
    for (let yDot = diagram.axis.y.from; yDot < diagram.axis.y.to; yDot += diagram.axis.y.step) {
        context.beginPath();
        context.moveTo(x + padding, diagram.y + diagram.height - yDot * ((diagram.height - padding * 2) / (diagram.axis.y.to - diagram.axis.y.from - 1)) - padding);
        context.lineTo(x + padding + 2, diagram.y + diagram.height - yDot * ((diagram.height - padding * 2) / (diagram.axis.y.to - diagram.axis.y.from - 1)) - padding);
        context.stroke();
    }

    // Diagram content
    let progress = bezier(frame / 300, 1, 1);

    context.setTransform(1, 0, 0, -1, x + padding, y + diagram.height - padding);

    let point = {
        x: diagram.points[0].x / (diagram.axis.x.to - diagram.axis.x.from - 1) * (diagram.width - padding * 2),
        y: diagram.points[0].y / (diagram.axis.y.to - diagram.axis.y.from - 1) * (diagram.height - padding * 2)
    };
    context.fillStyle = "#37474F";
    context.strokeStyle = "#37474F";
    context.lineWidth = 4;
    for (let i = 1; i < diagram.points.length && (i - 1) / (diagram.points.length - 1) < progress; i++) {
        context.beginPath();
        context.moveTo(point.x, point.y);

        let multiplier = i / (diagram.points.length - 1) < progress ? 1 : (progress - 1 / (diagram.points.length - 1) * (i - 1)) * (diagram.points.length - 1);

        point = {
            x: point.x + (diagram.points[i].x / (diagram.axis.x.to - diagram.axis.x.from - 1) * (diagram.width - padding * 2) - point.x) * multiplier,
            y: point.y + (diagram.points[i].y / (diagram.axis.y.to - diagram.axis.y.from - 1) * (diagram.height - padding * 2) - point.y) * multiplier
        };

        context.lineTo(point.x, point.y);
        context.stroke();

        context.beginPath();
        if (multiplier === 1) {
            context.arc(point.x, point.y, 3, 0, Math.PI * 2);
        } else {
            let angle = Math.atan2(
                (diagram.points[i].y / (diagram.axis.y.to - diagram.axis.y.from - 1) * (diagram.height - padding * 2)) - point.y,
                (diagram.points[i].x / (diagram.axis.x.to - diagram.axis.x.from - 1) * (diagram.width - padding * 2)) - point.x
            );
            context.moveTo(
                point.x + 10 * Math.cos(angle),
                point.y + 10 * Math.sin(angle)
            );
            context.lineTo(
                point.x + 10 * Math.cos(2 * Math.PI / 3 + angle),
                point.y + 10 * Math.sin(2 * Math.PI / 3 + angle)
            );
            context.lineTo(
                point.x + 10 * Math.cos(2 * Math.PI / 3 * 2 + angle),
                point.y + 10 * Math.sin(2 * Math.PI / 3 * 2 + angle)
            );
            context.lineTo(
                point.x + 10 * Math.cos(angle),
                point.y + 10 * Math.sin(angle)
            );
        }
        context.fill();
    }
    context.resetTransform();
}

function bezier(t, y0 = 1 / 3, y1 = 2 / 3) {
    return 3 * (y0) * Math.pow(1 - t, 2) * t + 3 * y1 * (1 - t) * Math.pow(t, 2) + (1) * Math.pow(t, 3);
}
