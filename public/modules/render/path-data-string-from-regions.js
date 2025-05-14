/**
 * Given an array of regions,
 * Returns an SVG path string that can be used to draw the regions.
 *
 * A region is an array of points. Each point is an [x, y] tuple.
 *
 * @param {[number, number][][]} regions - Array of regions
 * @returns {string} - SVG path data string
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
	if (pathDataString == "") pathDataString = "M0,0";
	return pathDataString;
}
