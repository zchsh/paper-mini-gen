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
		return renderPathsString(polygon.regions);
	});

	/**
	 * Derive a fallback viewBox... mostly pretty silly,
	 * should likely use viewBox etc from existing SVG element.
	 */
	if (!Array.isArray(viewBox)) {
		viewBox = getFallbackViewBox(polygons, viewBox);
	}

	/**
	 * Render the SVG string
	 */
	const [minX, minY, svgWidth, svgHeight] = viewBox;
	var svgString = `<svg width="${svgWidth}" height="${svgHeight}" viewBox="${minX} ${minY} ${svgWidth} ${svgHeight}">`;
	svgString += pathStrings
		.map((pathString) => {
			return `<path stroke="rgba(255,0,255,0.7)" fill-rule="nonzero" fill="rgba(255,0,255,0.3)" stroke-width="0.5" d="${pathString}"/>`;
		})
		.join("\n");
	svgString += "</svg>";
	return svgString;
}

function getFallbackViewBox(polygons, rawViewBox) {
	const allPoints = polygons.map((p) => p.regions.flat()).flat();
	const { minX, minY, maxX, maxY } = getBoundingPoints(allPoints);
	const viewBoxPadding = typeof rawViewBox === "number" ? rawViewBox : 0;
	const svgWidth = maxX - minX + viewBoxPadding * 2;
	const svgHeight = maxY - minY + viewBoxPadding * 2;
	const viewBox = [
		minX - viewBoxPadding,
		minY - viewBoxPadding,
		svgWidth,
		svgHeight,
	];
	return viewBox;
}
