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
	var svgString = `<svg style="margin-top:10px; margin-right:10px;margin-bottom:10px;background-color:#dddddd" width="${
		maxCoords.x + 10
	}" height="${maxCoords.y + 10}">`;

	const pathsToRender = polygon.regions.map((region, idx) => {
		return region.map((point) => {
			return { X: point[0], Y: point[1] };
		});
	});

	svgString +=
		'<path stroke="black" fill-rule="nonzero" fill="yellow" stroke-width="2" d="' +
		renderPathsString(pathsToRender, 1) +
		'"/>';
	svgString += "</svg>";
	return svgString;
}
