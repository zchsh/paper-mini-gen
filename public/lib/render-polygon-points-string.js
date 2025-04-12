/**
 * Given a polygon object,
 * render a string of space-separated points representing the polygon
 * with each point being a comma-separated pair of x,y co-ordinates, and
 * Return an array of regions, with each region being an array of
 *   [x, y] co-ordinatesthe polygon points string.
 *
 * The incoming polygon object argument has two properties:
 * - regions - an array of region entries. A region entry is an array of
 *   [x, y] co-ordinates in a tuple.
 * - inverted - a boolean value that should be ignored
 *
 * TODO: consider whether this function is even needed?
 * Rendering `<path />` elements from `polygon` data is just fine.
 *
 * @param {{ regions: [number, number][][], inverted: boolean }} polygon
 * @param {number} scale
 * @returns {[number, number][][]}
 */
function renderPointsStringsFromPolygonObject(polygon) {
	return polygon.regions.map((points) => {
		return renderPolygonPointsString(points);
	});
}

function renderPolygonPointsString(points) {
	return points.map(([x, y]) => `${x},${y}`).join(" ");
}
