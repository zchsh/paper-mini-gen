/**
 * Calculate the average position of two [x, y] points.
 *
 * @param {number[]} pointOne - The first point as an [x, y] tuple
 * @param {number[]} pointTwo - The second point as an [x, y] tuple
 * @returns {number[]} The average point as an [x, y] tuple
 */
export function getAveragePoint([x1, y1], [x2, y2]) {
	return [(x1 + x2) / 2, (y1 + y2) / 2];
}
