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
function renderPolygonsAsPathSvg(polygons, viewBox) {
	/**
	 * Actual conversion part
	 */
	const pathStrings = polygons.map((polygon) => {
		return renderPolygonAsPathString(polygon);
	});

	/**
	 * Derive a fallback viewBox... mostly pretty silly,
	 * should likely use viewBox etc from existing SVG element.
	 */
	if (!viewBox) {
		const allPoints = polygons.map((p) => p.regions.flat()).flat();
		const { minX, minY, maxX, maxY } = allPoints.reduce(
			(acc, point) => {
				const [x, y] = point;
				return {
					minX: acc.minX === null ? x : Math.min(acc.minX, x),
					minY: acc.minY === null ? y : Math.min(acc.minY, y),
					maxX: acc.maxX === null ? x : Math.max(acc.maxX, x),
					maxY: acc.maxY === null ? y : Math.max(acc.maxY, y),
				};
			},
			{ minX: null, minY: null, maxX: null, maxY: null }
		);
		const svgWidth = maxX - minX + 20;
		const svgHeight = maxY - minY + 20;
		viewBox = [minX - 10, minY - 10, svgWidth, svgHeight];
	}

	/**
	 * Render the SVG string
	 */
	const [minX, minY, svgWidth, svgHeight] = viewBox;
	console.log({ minX, minY, svgWidth, svgHeight });
	var svgString = `<svg width="${svgWidth}" height="${svgHeight}" viewBox="${minX} ${minY} ${svgWidth} ${svgHeight}">`;
	svgString += pathStrings
		.map((pathString) => {
			return `<path stroke="rgba(255,0,255,0.7)" fill-rule="nonzero" fill="rgba(255,0,255,0.3)" stroke-width="1" d="${pathString}"/>`;
		})
		.join("\n");
	svgString += "</svg>";
	return svgString;
}

/**
 *
 * @param {{ regions: [number, number][][]}} polygon
 */
function renderPolygonAsPathString(polygon) {
	const { regions } = polygon;
	const pathsToRender = regions.map((region, idx) => {
		const pointObjects = region.map((point) => {
			return { X: point[0], Y: point[1] };
		});
		// const isFirst = idx === 0;
		// return isFirst ? pointObjects : pointObjects.reverse();
		return pointObjects;
	});
	return renderPathsString(pathsToRender, 1);
}

/**
 * Converts Paths to SVG path string
 * and scales down the coordinates
 *
 * TODO: probably remove the scale part of things?
 * Or maybe I should be scaling up and down during the tracing process?
 */
function renderPathsString(paths, scale) {
	var svgpath = "",
		i,
		j;
	if (!scale) scale = 1;
	for (i = 0; i < paths.length; i++) {
		for (j = 0; j < paths[i].length; j++) {
			if (j === 0) {
				svgpath += "M";
			} else {
				svgpath += "L";
			}
			svgpath += paths[i][j].X / scale + ", " + paths[i][j].Y / scale;
		}
		svgpath += "Z";
	}
	if (svgpath == "") svgpath = "M0,0";
	return svgpath;
}
