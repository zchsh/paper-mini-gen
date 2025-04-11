/**
 * NOTE: expect some weirdness with winding order in some cases...
 * Currently trying to match the behaviour of:
 * https://www.github.com/velipso/polybooljs?tab=readme-ov-file
 * ie, the GeoJSON approach, as detailed here:
 * https://datatracker.ietf.org/doc/html/rfc7946#section-3.1.6
 * But, this approach doesn't seem universal. Be warned!
 *
 * @param {*} polygon
 * @returns
 */
function renderPolygonAsPathSvg(polygon) {
	const maxCoords = polygon.regions.reduce(
		(allMax, region) => {
			const maxInRegion = region.reduce(
				(rmax, coord) => {
					const [thisX, thisY] = coord;
					const newMaxX = Math.max(rmax.x, thisX);
					const newMaxY = Math.max(rmax.y, thisY);
					return { x: newMaxX, y: newMaxY };
				},
				{ x: 0, y: 0 }
			);
			return {
				x: Math.max(allMax.x, maxInRegion.x),
				y: Math.max(allMax.y, maxInRegion.y),
			};
		},
		{ x: 0, y: 0 }
	);
	console.log({ maxCoords });
	var svgString = `<svg style="margin-top:10px; margin-right:10px;margin-bottom:10px;background-color:#dddddd" width="${
		maxCoords.x + 10
	}" height="${maxCoords.y + 10}">`;
	/**
	 * This library does NOT follow the typical winding order rules...
	 * Instead, it seems to try to implement something like the GeoJSON
	 * approach:
	 * https://datatracker.ietf.org/doc/html/rfc7946#section-3.1.6
	 *
	 * I'm not actually sure the approach below will work for all cases...
	 * but so far, seems alright.
	 */
	const regionsReversed = polygon.regions.slice(0).reverse();
	const pathsToRender = regionsReversed.map((region, idx) => {
		const pointObjects = region.map((point) => {
			return { X: point[0], Y: point[1] };
		});
		const isFirst = idx === 0;
		return isFirst ? pointObjects : pointObjects.reverse();
	});
	svgString +=
		'<path stroke="black" fill-rule="nonzero" fill="yellow" stroke-width="2" d="' +
		renderPathsString(pathsToRender, 1) +
		'"/>';
	svgString += "</svg>";
	return svgString;
}
