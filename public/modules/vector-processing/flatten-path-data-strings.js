import { createSvgElem } from "../render/create-svg-elem.js";
import { reduceClusteredPoints } from "../03-trace/reduce-clustered-points.js";
import { cleanRegions } from "../clipperjs-wrappers/clean-regions.js";
import { simplifyRegions } from "../clipperjs-wrappers/simplify-regions.js";

/**
 * Given an array of path data strings, as well as a width and height
 * representing the bounds of the pah data, flatten all path data into
 * polygon points, and
 * Return an array of polygon objects, each with a `regions` property,
 * where each region is an array of points.
 *
 * @param {string[]} pathDataStrings
 * @returns {Array<{ regions: Array<Array<{ x: number, y: number }>} >}
 */
export function flattenPathDataStrings(pathDataStrings) {
	/**
	 * Create a new SVG element node. We're not rendering the SVG,
	 * so the SVG width, height, and viewBox don't matter.
	 */
	const svgElem = createSvgElem("svg");
	// Add <path /> elements for each path data string
	for (const pathDataString of pathDataStrings) {
		const pathElem = createSvgElem("path", { d: pathDataString });
		svgElem.appendChild(pathElem);
	}
	/**
	 * Flatten the SVG element. This produces a result that's in a format
	 * specific to https://github.com/nornagon/flatten-svg.
	 */
	const flattenSvgResult = flattenSVG(svgElem);
	/**
	 * Convert flattened paths to polygon data. This takes the format
	 * specific to https://github.com/nornagon/flatten-svg and converts it
	 * to polygon objects.
	 */
	const polygons = polygonsFromFlattenedPaths(flattenSvgResult);
	/**
	 * Clean up polygon data, using ClipperJS.
	 *
	 * For ClipperJS documentation, see:
	 * `simplifyPolygon`: https://sourceforge.net/p/jsclipper/wiki/documentation/#clipperlibclippersimplifypolygon
	 * `cleanPolygon`: https://sourceforge.net/p/jsclipper/wiki/documentation/#clipperlibclippercleanpolygon
	 */
	const polygonsCleaned = polygons.map((polygon) => {
		/**
		 * Note: reduceClusteredPoints is a bit redundant here,
		 * since cleanRegions() does a lot of the same stuff but better,
		 * but I had fun writing it, so I'm leaving it in.
		 */
		const regionsUnclustered = polygon.regions.map((region) => {
			return reduceClusteredPoints(region, 1);
		});
		/**
		 * cleanRegions() is kind of a more robust version of reduceClusteredPoints,
		 * removing micro-intersections and vertices that are too close together.
		 */
		const regionsCleaned = cleanRegions(regionsUnclustered, 0.2);
		/**
		 * simplifyRegions() uses SimplifyPolygons() from ClipperJS,
		 * to remove self-intersections, which makes the polygons
		 * much more straightforward to work with in subsequent operations.
		 */
		const regionsSimplified = simplifyRegions(regionsCleaned);
		return { regions: regionsSimplified };
	});
	// Return the parsed and cleaned polygon data
	return polygonsCleaned;
}

/**
 * TODO: add description and JSDOC
 * TODO: finish implementing this function
 * @returns
 */
function polygonsFromFlattenedPaths(paths) {
	// Group paths by groupId, each group will yield a polygon
	// const pathsGrouped = {};
	// for (const path of paths) {
	// 	const { groupId } = path;
	// 	if (!pathsGrouped[groupId]) {
	// 		pathsGrouped[groupId] = [];
	// 	}
	// 	pathsGrouped[groupId].push(path);
	// }
	/**
	 * TODO: use pathsGrouped rather than approach below
	 */
	// Initialize the polygons array
	const polygons = [];

	let regions = [];
	let currentGroupId = null;
	for (const path of paths) {
		/**
		 * TODO: is groupId still needed here?
		 * Have not implemented any kind of group assignment...
		 * But somehow things still seem to work?
		 */
		const { groupId, points } = path;

		const isFirstIteration = currentGroupId === null;
		const hasGroupId = typeof groupId === "string";
		const hasGroupIdMatch = hasGroupId && groupId === currentGroupId;
		if (isFirstIteration || hasGroupIdMatch) {
			regions.push(points);
		} else {
			// Push the existing regions to a polygon
			polygons.push({ regions });
			// Reset regions, we're starting a new polygon
			regions = [];
			// Push the points from this path as a region in the new polygon
			regions.push(points);
		}
		// Update the groupId
		currentGroupId = groupId;
	}
	// Push the in-progress region (not yet pushed, cause there was no
	// different groupID to follow it and cause it to be pushed)
	polygons.push({ regions });

	/**
	 *
	 */
	return polygons;
}
