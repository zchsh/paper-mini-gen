/**
 * Given an array of regions, where each region is an array of points,
 * and each point is an [x, y] tuple, as well as an offset amount, being
 * a number in units relative to the regions provided,
 * Return an array of regions representing an offset of the combined
 * original regions.
 *
 * NOTE: requires ClipperLib in the global scope
 *
 * NOTE: incoming regions should meet the following criteria:
 * - no self-intersections, even micro-self-intersections
 * - no vertices that are extremely close to each other
 * If you have a set of regions that may not meet these criteria, consider
 * using Clipper's SimplifyPolygons and CleanPolygons. An adjacent function
 * in this repository, simplifyRegions, does this for you.
 *
 * Documentation on ClipperOffset:
 * https://sourceforge.net/p/jsclipper/wiki/documentation/#clipperoffset
 *
 * @param {[number, number][][]} regions - array of regions, where each region
 * is an array of points, and each point is an [x, y] tuple.
 * @param {number} offsetAmount - amount to offset the regions by, in units
 * @returns {[number, number][][]} - array of regions representing the offset
 * shape
 */
export function applyOffsetToRegions(regionsSimplified, offsetAmount) {
	/**
	 * Clipper wants integer co-ordinates, so we scale up to avoid
	 * losing too much precision in rounding.
	 */
	const preScale = 10;
	const regionsPreScaled = regionsSimplified.map((region) => {
		return region.map(([X, Y]) => ({
			X: Math.round(X * 10),
			Y: Math.round(Y * 10),
		}));
	});
	// Set up the subject paths
	const subjectClipper = new ClipperLib.Paths();
	for (const regionPreScaled of regionsPreScaled) {
		subjectClipper.push(regionPreScaled);
	}
	// Scale up the paths, Clipper uses integers, this increases precision
	const clipperOffsetScale = 100;
	ClipperLib.JS.ScaleUpPaths(subjectClipper, clipperOffsetScale);
	// Set up the clipperOffset object
	const arcTolerance = 125;
	const miterLimit = 2;
	const clipperOffset = new ClipperLib.ClipperOffset(miterLimit, arcTolerance);
	// Add the subject paths, with the join and end types
	clipperOffset.AddPaths(
		subjectClipper,
		ClipperLib.JoinType.jtRound,
		ClipperLib.EndType.etClosedPolygon
	);
	// Execute the offset operation
	const offsetAmountScaled = offsetAmount * clipperOffsetScale * preScale;
	const solutionClipper = new ClipperLib.Paths();
	clipperOffset.Execute(solutionClipper, offsetAmountScaled);
	// Scale down the solution paths
	ClipperLib.JS.ScaleDownPaths(solutionClipper, clipperOffsetScale * preScale);
	// Convert the solution paths to a format we can use
	const solutionRegions = solutionClipper.map((regionClipper) => {
		return regionClipper.map(({ X, Y }) => [X, Y]);
	});
	// Return the solution regions
	return solutionRegions;
}
