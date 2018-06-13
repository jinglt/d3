/**
 * Calculates the point on the specified bounding box that is closest to the
 * specified point.
 *
 * @param {object} p            The point  path 起始点
 * @param {object} bBox         The bounding box   （x,y,width,heigth)正方形
 */
var getPerimeterPoint = function (p, bBox) {
    var TWO_PI = 2 * Math.PI;
    // calculate theta
    var theta = Math.atan2(bBox.height, bBox.width);

    // get the rectangle radius
    var xRadius = bBox.width / 2;
    var yRadius = bBox.height / 2;

    // get the center point
    var cx = bBox.x + xRadius;
    var cy = bBox.y + yRadius;

    // calculate alpha
    var dx = p.x - cx;
    var dy = p.y - cy;
    var alpha = Math.atan2(dy, dx);

    // normalize aphla into 0 <= alpha < 2 PI
    alpha = alpha % TWO_PI;
    if (alpha < 0) {
        alpha += TWO_PI;
    }

    // calculate beta
    var beta = (Math.PI / 2) - alpha;

    // detect the appropriate quadrant and return the point on the perimeter
    if ((alpha >= 0 && alpha < theta) || (alpha >= (TWO_PI - theta) && alpha < TWO_PI)) {
        // right quadrant
        return {
            'x': bBox.x + bBox.width,
            'y': cy + Math.tan(alpha) * xRadius
        };
    } else if (alpha >= theta && alpha < (Math.PI - theta)) {
        // bottom quadrant
        return {
            'x': cx + Math.tan(beta) * yRadius,
            'y': bBox.y + bBox.height
        };
    } else if (alpha >= (Math.PI - theta) && alpha < (Math.PI + theta)) {
        // left quadrant
        return {
            'x': bBox.x,
            'y': cy - Math.tan(alpha) * xRadius
        };
    } else {
        // top quadrant
        return {
            'x': cx - Math.tan(beta) * yRadius,
            'y': bBox.y
        };
    }
}

function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

var guid = function () {
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}
var isUndefined = function (obj) {
    return typeof obj === 'undefined';
}