import { createSvgElem } from "./create-svg-elem.js";

/**
 * A pretty "naive" converter that uses control points, and ignores
 * points on curves.
 *
 * TODO: look into alternatives to using pathSegList, as it's deprecated
 * https://github.com/progers/pathseg
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
			result.push(x, y);
		}
	}
	return regions;
}

/**
 *
 * TODO: what is the path data string has multiple regions?
 * Do we currently handle that properly? Might be worth investigating.
 *
 * @param {string} pathData
 * @returns
 */
export function regionsFromPathDataString(pathData) {
	/**
	 * Build an SVG path node, this is necessary to use pathSegList
	 * NOTE: also requires a polyfill for the deprecated pathSegList, see:
	 * https://github.com/progers/pathseg
	 */
	const pathNode = createSvgElem("path", { d: pathData });
	const rawRegions = pathSegListToRegions(pathNode.pathSegList);
	const regions = rawRegions.map((rawRegion) => {
		const region = rawRegion.reduce((acc, val, index) => {
			if (index % 2 === 0) {
				acc.push([val]);
			} else {
				acc[acc.length - 1].push(val);
			}
			return acc;
		}, []);
		return region;
	});

	return regions;
}
