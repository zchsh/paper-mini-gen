/**
 * Given an array of regions, where each region is an array of points,
 * and each point is an [x, y] tuple,
 * Return an array of similar regions, but with simplifications applied
 * by ClipperJS.
 *
 * NOTE: requires ClipperLib in the global scope
 *
 * Documentation on SimplifyPolygons:
 * https://sourceforge.net/p/jsclipper/wiki/documentation/#clipperlibclippersimplifypolygon
 *
 * @param {[number, number][][]} regions - array of regions, where each region
 * is an array of points, and each point is an [x, y] tuple.
 * @returns {[number, number][][]} - array of simplified regions
 */
export function simplifyRegions(regions) {
	// Convert the incoming regions to Clipper's format
	const polygonsClipper = regions.map((region) => {
		return region.map(([X, Y]) => ({ X, Y }));
	});
	// Run Clipper's SimplifyPolygons
	const polygonsClipperSimplified = ClipperLib.Clipper.SimplifyPolygons(
		polygonsClipper,
		ClipperLib.PolyFillType.pftNonZero
	);
	// Convert back to our regions format
	const regionsSimplified = polygonsClipperSimplified.map((region) => {
		return region.map(({ X, Y }) => [X, Y]);
	});
	// Remove any regions with fewer than 3 points
	const regionsFiltered = regionsSimplified.filter((region) => {
		return region.length >= 3;
	});
	// Return the cleaned regions
	return regionsFiltered;
}
