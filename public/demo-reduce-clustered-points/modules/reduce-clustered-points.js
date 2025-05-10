import { getDistanceBetweenPoints } from "./get-distance-between-points.js";
import { getAveragePoint } from "./get-average-point.js";

/**
 * Given an array of [x, y] points, and a tolerance distance,
 * reduce the number of points in the array by finding sequential
 * points that are very close together (within the tolerance distance),
 * replacing them with a single point in the average position, and
 * Return the reduced array of points.
 *
 * If there are fewer than 3 points, we can't reduce anything without
 * losing the nature of the shape itself, so we return the points as-is.
 *
 * @param {Array} points - An array of [x, y] points.
 * @param {number} tolerance - The distance within which points are considered redundant.
 * @return {Array} - A new array of points with redundant points removed.
 */
export function reduceClusteredPoints(points, tolerance = 5) {
	/**
	 * We need at least 3 points to have a useful shape.
	 * If we have fewer than 3 points, return early, even if they're
	 * close together, none of the points can be removed.
	 */
	if (points.length < 3) {
		return points;
	}
	// We'll start with the first point as our "active" point
	let currentPoint = points[0];
	const reducedPoints = [];
	for (let i = 0; i < points.length - 1; i++) {
		// We'll compare the current point to the next point in the array
		const nextPoint = points[i + 1];
		// The current and next points are redundant if they're close together
		const isRedundant =
			getDistanceBetweenPoints(currentPoint, nextPoint) < tolerance;
		/**
		 * If the current and next points are redundant, we average their
		 * position. The new average point becomes the current point,
		 * and we move on to the next point. Note that we do not yet
		 * push this new average point to the reducedPoints array - we
		 * may average it again if the next point is very close!
		 *
		 * Else, if the current and next points are not redundant,
		 * then our currentPoint is a meaningfully unique position,
		 * so we push it to the reducedPoints array. When we run the
		 * next iteration, we'll take one step forward and compare
		 * the next point to the one after that.
		 */
		if (isRedundant) {
			const averagePoint = getAveragePoint(currentPoint, nextPoint);
			currentPoint = averagePoint;
		} else {
			reducedPoints.push(currentPoint);
			currentPoint = points[i + 1];
		}
	}
	return reducedPoints;
}
