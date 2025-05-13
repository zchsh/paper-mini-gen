/**
 * Converts an array of regions to an SVG path string.
 * A region is an array of points, and each point is an [x, y] tuple.
 *
 * @param {Array} regions - Array of regions, each region is an array of points
 * @returns {string} - SVG path string
 */
export function pathDataStringFromRegions(regions) {
	let pathDataString = "";
	for (const region of regions) {
		for (let i = 0; i < region.length; i++) {
			const isFirstPoint = i === 0;
			if (isFirstPoint) {
				pathDataString += "M";
			} else {
				pathDataString += "L";
			}
			const point = region[i];
			const [x, y] = point;
			pathDataString += x + ", " + y;
		}
		pathDataString += "Z";
	}
	console.log({ pathDataString });
	if (pathDataString == "") pathDataString = "M0,0";
	return pathDataString;
}
