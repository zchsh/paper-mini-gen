import { createSvgElem } from "./create-svg-elem.js";

/**
 * Given an SVG pathSegList,
 * Returns an array of regions derived from the pathSegList.
 *
 * Note: use of this function requires a polyfill for pathSegList.
 *
 * Note: this is a pretty "naive" converter that uses control points only.
 * This tool ignores any points on curved segments. It's therefore best used
 * with polygons that are already "flattened" into straight lines.
 *
 * TODO (later): look into alternatives to using the deprecated pathSegList.
 * https://github.com/progers/pathseg is the polyfill.
 * However, currently SVG PathData seems to have pretty poor support:
 * https://developer.mozilla.org/en-US/docs/Web/API/SVGPathElement/getPathData#browser_compatibility
 * So... feels like it's fine to just leave this for now.
 *
 * @param {SVGPathSegList} pathSegList - The pathSegList to convert
 * @returns {[number, number][][]} - An array of regions. Each region is an
 * array of points. Each point is an [x, y] tuple.
 */
function pathSegListToRegions(pathSegList) {
	var count = pathSegList.numberOfItems;
	var regions = [];
	var result = [];
	var segment, x, y;
	for (var i = 0; i < count; i++) {
		segment = pathSegList.getItem(i);
		switch (segment.pathSegType) {
			case SVGPathSeg.PATHSEG_MOVETO_ABS:
			case SVGPathSeg.PATHSEG_LINETO_ABS:
			case SVGPathSeg.PATHSEG_CURVETO_CUBIC_ABS:
			case SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_ABS:
			case SVGPathSeg.PATHSEG_ARC_ABS:
			case SVGPathSeg.PATHSEG_CURVETO_CUBIC_SMOOTH_ABS:
			case SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_SMOOTH_ABS:
				x = segment.x;
				y = segment.y;
				break;
			case SVGPathSeg.PATHSEG_MOVETO_REL:
			case SVGPathSeg.PATHSEG_LINETO_REL:
			case SVGPathSeg.PATHSEG_CURVETO_CUBIC_REL:
			case SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_REL:
			case SVGPathSeg.PATHSEG_ARC_REL:
			case SVGPathSeg.PATHSEG_CURVETO_CUBIC_SMOOTH_REL:
			case SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_SMOOTH_REL:
				x = segment.x;
				y = segment.y;
				if (result.length > 1) {
					x += result[result.length - 2];
					y += result[result.length - 1];
				}
				break;
			case SVGPathSeg.PATHSEG_LINETO_HORIZONTAL_ABS:
				x = segment.x;
				y = result[result.length - 1];
				break;
			case SVGPathSeg.PATHSEG_LINETO_HORIZONTAL_REL:
				x = result[result.length - 2] + segment.x;
				y = result[result.length - 1];
				break;
			case SVGPathSeg.PATHSEG_LINETO_VERTICAL_ABS:
				x = result[result.length - 2];
				y = segment.y;
				break;
			case SVGPathSeg.PATHSEG_LINETO_VERTICAL_REL:
				x = result[result.length - 2];
				y = segment.y + result[result.length - 1];
				break;
			case SVGPathSeg.PATHSEG_CLOSEPATH:
				// close the current region
				if (result.length > 0) {
					regions.push(result);
					result = [];
				}
				// we have no [x, y] coordinates to push, so assign to null
				x = null;
				y = null;
				break;
			default:
				console.log("unknown path command: ", segment.pathSegTypeAsLetter);
		}
		if (x !== null || y !== null) {
			result.push([x, y]);
		}
	}
	return regions;
}

/**
 * Given a string of SVG path data,
 * Return an array of regions derived from the path data. A region is an
 * array of points. Each point is an [x, y] tuple.
 *
 * Note: use of this function requires a polyfill for pathSegList.
 * Example: https://github.com/progers/pathseg
 *
 * @param {string} pathData A string of SVG path data
 * @returns {[number, number][][]} An array of regions. Each region is an
 * array of points. Each point is an [x, y] tuple.
 */
export function regionsFromPathDataString(pathData) {
	// Build an SVG path node, this is necessary to use pathSegList
	const pathNode = createSvgElem("path", { d: pathData });
	// Convert the pathNode's pathSegList to regions, and return those regions
	return pathSegListToRegions(pathNode.pathSegList);
}
