/**
 * TODO: write description
 *
 * Roughed in from:
 * https://sourceforge.net/p/jsclipper/wiki/documentation/#clipperlibclipperoffsetexecute
 *
 * NOTE: requires ClipperLib in the global scope
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
