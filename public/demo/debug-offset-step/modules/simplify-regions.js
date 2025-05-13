/**
 * TODO: write description
 *
 * NOTE: requires ClipperLib in the global scope
 */
export function simplifyRegions(regions) {
	const polygonsClipper = regions.map((region) => {
		return region.map(([X, Y]) => ({ X, Y }));
	});
	const polygonsClipperSimplified = ClipperLib.Clipper.SimplifyPolygons(
		polygonsClipper,
		ClipperLib.PolyFillType.pftNonZero
	);
	const polygonsSimplified = polygonsClipperSimplified.map((region) => {
		return region.map(({ X, Y }) => [X, Y]);
	});
	return polygonsSimplified;
}
