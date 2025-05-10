/**
 * Calculate the distance between two [x,y] points,
 * using the Pythagorean theorem.
 *
 * @param {number[]} pointOne - The first point as an [x, y] tuple
 * @param {number[]} pointTwo - The second point as an [x, y] tuple
 * @returns {number} The distance between the two points
 */
function getDistanceBetweenPoints([x1, y1], [x2, y2]) {
	return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}
