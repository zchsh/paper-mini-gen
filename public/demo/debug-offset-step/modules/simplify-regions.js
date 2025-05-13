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
 * TODO: consider whether to also use CleanPolygons:
 * https://sourceforge.net/p/jsclipper/wiki/documentation/#clipperlibclippercleanpolygon
 *
 * @param {[number, number][][]} regions - array of regions, where each region
 * is an array of points, and each point is an [x, y] tuple.
 * @returns {[number, number][][]} - array of simplified regions
 */
export function simplifyRegions(regions) {
	const polygonsClipper = regions.map((region) => {
		return region.map(([X, Y]) => ({ X, Y }));
	});
	const polygonsClipperSimplified = ClipperLib.Clipper.SimplifyPolygons(
		polygonsClipper,
		ClipperLib.PolyFillType.pftNonZero
	);
	const regionsSimplified = polygonsClipperSimplified.map((region) => {
		return region.map(({ X, Y }) => [X, Y]);
	});
	return regionsSimplified;
}
