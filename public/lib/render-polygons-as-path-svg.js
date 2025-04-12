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
function renderPolygonsAsPathSvg(polygons) {
	const allPoints = polygons.map((p) => p.regions.flat()).flat();
	const { minX, minY, maxX, maxY } = allPoints.reduce(
		(acc, point) => {
			const [x, y] = point;
			return {
				minX: acc.minX === null ? x : Math.min(acc.minX, x),
				minY: acc.minY === null ? y : Math.min(acc.minX, y),
				maxX: acc.maxX === null ? x : Math.max(acc.maxX, x),
				maxY: acc.maxY === null ? y : Math.max(acc.maxY, y),
			};
		},
		{ minX: null, minY: null, maxX: null, maxY: null }
	);
	const svgWidth = maxX - minX;
	const svgHeight = maxY - minY;
	var svgString = `<svg style="margin-top:10px; margin-right:10px;margin-bottom:10px;background-color:#dddddd" width="${svgWidth}" height="${svgHeight}" viewBox="${minX} ${minY} ${svgWidth} ${svgHeight}>`;
	for (const polygon of polygons) {
		const { regions } = polygon;
		const pathsToRender = regions.map((region, idx) => {
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
	}

	svgString += "</svg>";
	return svgString;
}
