// Standard DDA implementation for integer coordinate end points.
//
// Calculates the number of pixels on the major axis, then samples
// pixels at (deltaX / numPixels, deltaY / numPixels) steps.
//
// The current pixel coordinate under investigation is stored in (x, y)
// which is initially incremented by 0.5 on each axis so we can use
// Math.floor() instead of the more expensive Math.round().
// 
// Gives the same result as Bresenham's algorithm for integer
// start and end point coordinates, but uses floating point math.
//
// This implementation implicitely implements the diamond exit rule.
function lineDDA(x1, y1, x2, y2) {
    x1 = Math.floor(x1);
    y1 = Math.floor(y1);
    x2 = Math.floor(x2);
    y2 = Math.floor(y2);
    const deltaX = (x2 - x1);
    const deltaY = (y2 - y1);

    if (deltaX == 0 && deltaY == 0) {
        drawPixel(x1, y1);
        return;
    }

    const numPixels = Math.abs(deltaX) > Math.abs(deltaY) ? Math.abs(deltaX) : Math.abs(deltaY);
    const stepX = deltaX / numPixels;
    const stepY = deltaY / numPixels;
    let x = x1 + 0.5;
    let y = y1 + 0.5;
    for (let i = 0; i <= numPixels; i++) {
        steppedPoints.push({ x: x, y: y });
        drawPixel(Math.floor(x), Math.floor(y));
        x += stepX;
        y += stepY;
    }
}

// Sub-pixel DDA implementation for non-integer start and end points.
//
// Calculates the number of pixels on the major axis, then samples
// pixels at (deltaX / (numPixels - 1), deltaY / (numPixels - 1) intervals.
//
// This is basically a lerp between the start and end point with `numPixels - 1` steps.
function lineSubpixelDDA(x1, y1, x2, y2) {
    const deltaX = (x2 - x1);
    const deltaY = (y2 - y1);

    const numPixelsX = Math.abs(Math.floor(x2) - Math.floor(x1)) + 1;
    const numPixelsY = Math.abs(Math.floor(y2) - Math.floor(y1)) + 1;
    const numPixels = numPixelsX > numPixelsY ? numPixelsX : numPixelsY;

    if (numPixels == 1) {
        drawPixel(Math.floor(x1), Math.floor(y1));
        return;
    }

    const stepX = deltaX / (numPixels - 1);
    const stepY = deltaY / (numPixels - 1);
    let x = x1;
    let y = y1;
    for (let i = 0; i < numPixels; i++) {
        steppedPoints.push({ x: x, y: y });
        drawPixel(Math.floor(x), Math.floor(y));
        x += stepX;
        y += stepY;
    }
}

// Sub-pixel DDA for non-integer start and end points.
//
// Instead of sampling the line at `numPixels - 1` intervals, it
// sample's the pixels between the start and end points at the
// pixel-center on the major axis. This makes it more similar to
// sub-pixel Bresenham.
//
// This function omits the end point pixel to be more in line with the
// diamond exit rule.
function lineSubpixelDDACenterSampling(x1, y1, x2, y2) {
    const deltaX = (x2 - x1);
    const deltaY = (y2 - y1);

    const numPixelsX = Math.abs(Math.floor(x2) - Math.floor(x1)) + 1;
    const numPixelsY = Math.abs(Math.floor(y2) - Math.floor(y1)) + 1;
    let numPixels = Math.abs(deltaX) > Math.abs(deltaY) ? numPixelsX : numPixelsY;

    if (numPixels == 0) {
        drawPixel(Math.floor(x1), Math.floor(y1));
        return;
    }

    let x, y, stepX, stepY;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        stepX = x1 < x2 ? 1 : -1;
        stepY = deltaY / Math.abs(deltaX);
        x = Math.floor(x1) + 0.5 + stepX;
        y = y1 + Math.abs(x - x1) * stepY;
    } else {
        stepY = y1 < y2 ? 1 : -1;
        stepX = deltaX / Math.abs(deltaY);
        y = Math.floor(y1) + 0.5 + stepY;
        x = x1 + Math.abs(y - y1) * stepX;
    }

    drawPixel(Math.floor(x1), Math.floor(y1));
    for (let i = 1; i < numPixels; i++) {
        steppedPoints.push({ x: x, y: y });
        drawPixel(Math.floor(x), Math.floor(y));
        x += stepX;
        y += stepY;
    }
}

// Same as above, but does not omit the last pixel
function lineSubpixelDDACenterSamplingIncludeEndpoint(x1, y1, x2, y2) {
    const deltaX = (x2 - x1);
    const deltaY = (y2 - y1);

    const numPixelsX = Math.abs(Math.floor(x2) - Math.floor(x1)) + 1;
    const numPixelsY = Math.abs(Math.floor(y2) - Math.floor(y1)) + 1;
    let numPixels = Math.abs(deltaX) > Math.abs(deltaY) ? numPixelsX : numPixelsY;

    if (numPixels == 1) {
        drawPixel(Math.floor(x1), Math.floor(y1));
        return;
    }

    let x, y, stepX, stepY;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        stepX = x1 < x2 ? 1 : -1;
        stepY = deltaY / Math.abs(deltaX);
        x = Math.floor(x1) + 0.5 + stepX;
        y = y1 + Math.abs(x - x1) * stepY;
    } else {
        stepY = y1 < y2 ? 1 : -1;
        stepX = deltaX / Math.abs(deltaY);
        y = Math.floor(y1) + 0.5 + stepY;
        x = x1 + Math.abs(y - y1) * stepX;
    }

    drawPixel(Math.floor(x1), Math.floor(y1));
    for (let i = 1; i < numPixels - 1; i++) {
        steppedPoints.push({ x: x, y: y });
        drawPixel(Math.floor(x), Math.floor(y));
        x += stepX;
        y += stepY;
    }

    // Last calculated pixel coordinate != end point pixel coordinate?
    // Plot both calculated pixel and end point pixel.
    // E.g.
    // p1 = {x: 5.49375, y: 5.478125}
    // p2 = {x: 10.121875, y: 10.890625}
    if (Math.floor(x2) != Math.floor(x) || Math.floor(y2) != Math.floor(y)) {
        // FIXME Check if the calculated sub-pixel coordinate is outside
        // the line segment. E.g. 
        // p1 = {x: 5.49375, y: 5.478125}
        // p2 = {x: 1.1999999999999993, y: 10.21875}
        steppedPoints.push({ x: x, y: y });
        drawPixel(Math.floor(x), Math.floor(y));
    }
    drawPixel(Math.floor(x2), Math.floor(y2));
}

//
// Basic Bresenham for all octants. `x` and `y` are
// set to the start point coordinates. `error` starts out
// storing the the (absolute) distance from the point on
// line sampled at the next coordinate along the major axis to the pixel
// border "above" it. If that distance is > 0.5, we move
// "up" by 1 on the minor axis, and decrement the error by 1.
//
function lineBresenham1(x1, y1, x2, y2) {
    x1 = Math.floor(x1);
    y1 = Math.floor(y1);
    x2 = Math.floor(x2);
    y2 = Math.floor(y2);
    let deltaX = Math.abs(x2 - x1);
    let deltaY = Math.abs(y2 - y1);
    let stepX = (x1 < x2) ? 1 : -1;
    let stepY = (y1 < y2) ? 1 : -1;
    let x = x1;
    let y = y1;

    if (deltaX == 0 && deltaY == 0) {
        drawPixel(x, y);
        return;
    }

    if (deltaX >= deltaY) {
        let slope = deltaY / deltaX;
        let error = slope;
        for (let i = 0, n = deltaX; i <= n; i++) {
            steppedPoints.push({ x: x + 0.5, y: y + 0.5 });
            drawPixel(x, y);
            if (error > 0.5) {
                error -= 1;
                y += stepY;
            }
            x += stepX;
            error += slope;
        }
    } else {
        let slope = deltaX / deltaY;
        let error = slope;
        for (let i = 0, n = deltaY; i <= n; i++) {
            steppedPoints.push({ x: x + 0.5, y: y + 0.5 });
            drawPixel(x, y);
            if (error > 0.5) {
                error -= 1;
                x += stepX;
            }
            y += stepY;
            error += slope;
        }
    }
    if (x != Math.floor(x2) && y != Math.floor(y2)) {
        drawPixel(x, y);
    }
}

//
// Rewrites the "move up" condition from error > 0.5 to error > 0
// by subtracting 0.5 from the initial error.
//
function lineBresenham2(x1, y1, x2, y2) {
    x1 = Math.floor(x1);
    y1 = Math.floor(y1);
    x2 = Math.floor(x2);
    y2 = Math.floor(y2);
    let deltaX = Math.abs(x2 - x1);
    let deltaY = Math.abs(y2 - y1);
    let stepX = (x1 < x2) ? 1 : -1;
    let stepY = (y1 < y2) ? 1 : -1;
    let x = x1;
    let y = y1;

    if (deltaX == 0 && deltaY == 0) {
        drawPixel(x, y);
        return;
    }

    if (deltaX >= deltaY) {
        let slope = deltaY / deltaX;
        let error = slope - 0.5;
        for (let i = 0, n = deltaX; i <= n; i++) {
            steppedPoints.push({ x: x + 0.5, y: y + 0.5 });
            drawPixel(x, y);
            if (error > 0) {
                error -= 1;
                y += stepY;
            }
            x += stepX;
            error += slope;
        }
    } else {
        let slope = deltaX / deltaY;
        let error = slope - 0.5;
        for (let i = 0, n = deltaY; i <= n; i++) {
            steppedPoints.push({ x: x + 0.5, y: y + 0.5 });
            drawPixel(x, y);
            if (error > 0) {
                error -= 1;
                x += stepX;
            }
            y += stepY;
            error += slope;
        }
    }
}

//
// Gets rid of the division to calculate the slope by
// multiplying the right hand side of assignments to
// error by deltaX or deltaY, depending on the major axis.
// This also eliminates `slope` everywhere.
function lineBresenham3(x1, y1, x2, y2) {
    x1 = Math.floor(x1);
    y1 = Math.floor(y1);
    x2 = Math.floor(x2);
    y2 = Math.floor(y2);
    let deltaX = Math.abs(x2 - x1);
    let deltaY = Math.abs(y2 - y1);
    let stepX = (x1 < x2) ? 1 : -1;
    let stepY = (y1 < y2) ? 1 : -1;
    let x = x1;
    let y = y1;

    if (deltaX == 0 && deltaY == 0) {
        drawPixel(x, y);
        return;
    }

    if (deltaX >= deltaY) {
        let error = deltaY - 0.5 * deltaX;
        for (let i = 0, n = deltaX; i <= n; i++) {
            steppedPoints.push({ x: x + 0.5, y: y + 0.5 });
            drawPixel(x, y);
            if (error > 0) {
                error -= deltaX;
                y += stepY;
            }
            x += stepX;
            error += deltaY;
        }
    } else {
        let error = deltaX - 0.5 * deltaY;
        for (let i = 0, n = deltaY; i <= n; i++) {
            steppedPoints.push({ x: x + 0.5, y: y + 0.5 });
            drawPixel(x, y);
            if (error > 0) {
                error -= deltaY;
                x += stepX;
            }
            y += stepY;
            error += deltaX;
        }
    }
}


// Multiplies the right hand side of all assignments to error
// by 2 to remove the multiplication by 0.5 when calculating
// the initial error. This makes the algorithm integer only.
function lineBresenham(x1, y1, x2, y2) {
    x1 = Math.floor(x1);
    y1 = Math.floor(y1);
    x2 = Math.floor(x2);
    y2 = Math.floor(y2);
    let deltaX = Math.abs(x2 - x1);
    let deltaY = Math.abs(y2 - y1);
    let stepX = (x1 < x2) ? 1 : -1;
    let stepY = (y1 < y2) ? 1 : -1;
    let x = x1;
    let y = y1;

    if (deltaX == 0 && deltaY == 0) {
        drawPixel(x, y);
        return;
    }

    if (deltaX > deltaY) {
        let error = 2 * deltaY - deltaX;
        for (let i = 0, n = deltaX; i <= n; i++) {
            steppedPoints.push({ x: x + 0.5, y: y + 0.5 });
            drawPixel(x, y);
            if (error > 0) {
                error -= deltaX * 2;
                y += stepY;
            }
            x += stepX;
            error += deltaY * 2;
        }
    } else {
        let error = 2 * deltaX - deltaY;
        for (let i = 0, n = deltaY; i <= n; i++) {
            steppedPoints.push({ x: x + 0.5, y: y + 0.5 });
            drawPixel(x, y);
            if (error > 0) {
                error -= deltaY * 2;
                x += stepX;
            }
            y += stepY;
            error += deltaX * 2;
        }
    }
}

function lineSubPixelBresenham(x1, y1, x2, y2) {
    let deltaX = Math.abs(x2 - x1);
    let deltaY = Math.abs(y2 - y1);
    let stepX = (x1 < x2) ? 1 : -1;
    let stepY = (y1 < y2) ? 1 : -1;
    let x = Math.floor(x1);
    let y = Math.floor(y1);

    if (deltaX > deltaY) {
        let dist_next_pixel = Math.abs(Math.floor(x1) + 0.5 + stepX - x1);
        let dist_pixel_edge = Math.abs(y1) - Math.floor(Math.abs(y1));
        if (y1 > y2) dist_pixel_edge = 1 - dist_pixel_edge;
        let error = dist_pixel_edge * deltaX + dist_next_pixel * deltaY;
        let numPixels = Math.abs(Math.floor(x2) - x);
        for (let i = 0; i < numPixels; i++) {
            steppedPoints.push({ x: x + 0.5, y: y + 0.5 });
            helperLines.push({ x1: x + 0.5, y1: y + (y2 < y1 ? -stepY : 0), x2: x + 0.5, y2: y + (y2 < y1 ? -error / deltaX : error / deltaX) + (y2 < y1 ? -stepY : 0) });

            drawPixel(x, y);
            if (error >= deltaX) {
                error -= deltaX;
                y += stepY;
            }
            x += stepX;
            error += deltaY;
        }
        if (x != Math.floor(x2) || y != Math.floor(y2)) {
            if (y != Math.floor(y2) + stepY) drawPixel(x, y);
        }
    } else {
        let dist_next_pixel = Math.abs(Math.floor(y1) + 0.5 + stepY - y1);
        let dist_pixel_edge = Math.abs(x1) - Math.floor(Math.abs(x1));
        if (x1 > x2) dist_pixel_edge = 1 - dist_pixel_edge;
        let error = dist_pixel_edge * deltaY + dist_next_pixel * deltaX;
        let numPixels = Math.abs(Math.floor(y2) - y);
        for (let i = 0; i < numPixels; i++) {
            steppedPoints.push({ x: x + 0.5, y: y + 0.5 });
            helperLines.push({ x1: x + (x2 < x1 ? -stepX : 0), y1: y + 0.5, x2: x + (x2 < x1 ? -error / deltaY : error / deltaY) + (x2 < x1 ? -stepX : 0), y2: y + 0.5 });

            drawPixel(x, y);
            if (error >= deltaY) {
                error -= deltaY;
                x += stepX;
            }
            y += stepY;
            error += deltaX;
        }
        if (x != Math.floor(x2) || y != Math.floor(y2)) {
            if (x != Math.floor(x2) + stepX) drawPixel(x, y);
        }
    }
}