/**
 * Given an array of regions, where each region is an array of points,
 * and each point is an [x, y] tuple,
 * Return an array of similar regions, but with cleaning applied
 * by ClipperJS.
 *
 * NOTE: requires ClipperLib in the global scope
 *
 * NOTE: cleaning may sometimes remove a region entirely.
 *
 * Documentation on CleanPolygon:
 * https://sourceforge.net/p/jsclipper/wiki/documentation/#clipperlibclippercleanpolygon
 *
 * @param {[number, number][][]} regions - array of regions, where each region
 * is an array of points, and each point is an [x, y] tuple.
 * @param {number} cleanThreshold - threshold for cleaning the regions. Higher
 * values will result in more aggressive simplification of paths.
 * @returns {[number, number][][]} - array of simplified regions
 */
export function cleanRegions(regions, cleanThreshold = 0.1) {
	// Convert the incoming regions to Clipper's format
	const polygonsClipper = regions.map((region) => {
		return region.map(([X, Y]) => ({ X, Y }));
	});
	// Run Clipper's CleanPolygons
	const polygonsClipperCleaned = ClipperLib.Clipper.CleanPolygons(
		polygonsClipper,
		cleanThreshold
	);
	// Convert back to our regions format
	const regionsSimplified = polygonsClipperCleaned.map((regionClipper) => {
		return regionClipper.map(({ X, Y }) => [X, Y]);
	});
	// Remove any regions with fewer than 3 points
	const regionsFiltered = regionsSimplified.filter((region) => {
		return region.length >= 3;
	});
	// Return the cleaned regions
	return regionsFiltered;
}
