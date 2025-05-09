/**
 * Converts an array of regions to an SVG path string
 *
 * @param {Array} regions - Array of regions, each region is an array of points
 * @returns {string} - SVG path string
 */
function pathDataStringFromRegions(regions) {
	let svgpath = "";
	for (const region of regions) {
		for (let i = 0; i < region.length; i++) {
			const point = region[i];
			const isFirstPoint = i === 0;
			if (isFirstPoint) {
				svgpath += "M";
			} else {
				svgpath += "L";
			}
			const [x, y] = point;
			svgpath += x + ", " + y;
		}
		svgpath += "Z";
	}
	if (svgpath == "") svgpath = "M0,0";
	return svgpath;
}
