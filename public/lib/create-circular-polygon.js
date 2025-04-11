/**
 * Given a target radius, and a pointCount representing the number
 * of points on the resulting shape,
 * Return x,y co-ordinates, in clockwise order, describing the polygon
 * with pointCount number of points that fits within a circle of the
 * target radius.
 *
 * @param {number} radius The target radius of the circle that contains the polygon
 * @param {number} pointCount The number of points on the polygon. Must be 3 or greater.
 * @param {[number, number]} centerPoint The point about which the polygon should be centered.
 * @returns {[number, number][]}
 */
function createCircularPolygon(radius, pointCount, centerPoint = [0, 0]) {
	// TODO: code below was spit out by Copilot, may or may not be correct
	if (radius <= 0) {
		throw new Error("radius must be greater than 0");
	}
	if (pointCount < 3) {
		throw new Error("pointCount must be 3 or greater");
	}

	const points = [];
	const angleIncrement = (2 * Math.PI) / pointCount;

	// Create the polygon around [0,0]
	for (let i = 0; i < pointCount; i++) {
		const angle = i * angleIncrement;
		const x = radius * Math.cos(angle);
		const y = radius * Math.sin(angle);
		points.push([x, y]);
	}

	// Translate the polygon to move it to the desired centerPoint
	const translatedPoints = translatePoints(points, centerPoint);
	return translatedPoints;
}

/**
 * Given an array of points, and an xyTranslation to apply,
 * Return the translated points.
 *
 * @param {[number, number][]} points
 * @param {[number, number]} xyTranslation
 * @returns {[number, number][]}
 */
function translatePoints(points, xyTranslation) {
	const [deltaX, deltaY] = xyTranslation;
	return points.map(([x, y]) => {
		return [x + deltaX, y + deltaY];
	});
}
