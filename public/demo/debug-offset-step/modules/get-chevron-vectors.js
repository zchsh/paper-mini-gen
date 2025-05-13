import { rotatePoint } from "./rotate-point.js";

/**
 * Given two points, a chevron length, and an angle,
 * Return two chevron-like lines that point in the direction of the line.
 *
 * @param {[number, number]} lineStart
 * @param {[number, number]} lineEnd
 * @param {number} chevronLength
 * @param {number} chevronAngleDegrees
 * @returns {[{x1: number, y1: number, x2: number, y2: number}, {x1: number, y1: number, x2: number, y2: number}]}
 */
export function getChevronVectors(
	[x1, y1],
	[x2, y2],
	chevronLength,
	chevronAngleDegrees = 30
) {
	// Find the point on the line that's a chevron's length from the end
	const run = x2 - x1;
	const rise = y2 - y1;
	const lineLength = Math.hypot(run, rise);
	const ratio = chevronLength / lineLength;
	const pointOnLine = [x2 - ratio * run, y2 - ratio * rise];
	// Rotate the point on the line around [x2, y2], to get chevron start points
	const angleRadians = (chevronAngleDegrees * Math.PI) / 180;
	const upperStart = rotatePoint(pointOnLine, angleRadians, [x2, y2]);
	const lowerStart = rotatePoint(pointOnLine, -1 * angleRadians, [x2, y2]);
	// Return the upper and lower chevron vectors
	return [
		{ x1: upperStart[0], y1: upperStart[1], x2, y2 },
		{ x1: lowerStart[0], y1: lowerStart[1], x2, y2 },
	];
}
