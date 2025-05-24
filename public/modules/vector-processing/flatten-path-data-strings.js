import { buildSvgRootNode } from "../render/build-svg-root-node.js";
import { createSvgElem } from "../render/create-svg-elem.js";
import { reduceClusteredPoints } from "../03-trace/reduce-clustered-points.js";
/**
 * Given an array of path data strings, flatten all path data into
 * polygon points, and
 * Return an array of polygon objects, each with a `regions` property,
 * where each region is an array of points.
 *
 * TODO: finish implementing this function
 *
 * @param {string[]} pathDataStrings
 */
export function flattenPathDataStrings(pathDataStrings, svgWidth, svgHeight) {
	// Create a new SVG element node
	const svgViewBox = [0, 0, svgWidth, svgHeight];
	const svgElem = buildSvgRootNode(svgViewBox);
	// Add <path /> elements for each path data string
	for (const pathDataString of pathDataStrings) {
		const pathElem = createSvgElem("path", { d: pathDataString });
		svgElem.appendChild(pathElem);
	}
	// Flatten the SVG element into
	const paths = flattenSVG(svgElem);
	console.log({ paths });
	/**
	 * Convert flattened paths to polygon data
	 */
	const polygons = polygonsFromFlattenedPaths(paths);
	console.log({ polygons });

	/**
	 * Clean up polygon data with ClipperJS
	 */
	// const polygonsCleaned = polygons.map((polygon) => {
	//   const regionsCleaned = cleanRegions(polygon.regions, 0.2);
	//   const regionsSimplified = simplifyRegions(regionsCleaned);
	//   return { regions: regionsSimplified };
	// });
	// Return
	return polygons;
}

/**
 * TODO: add description and JSDOC
 * TODO: finish implementing this function
 * @returns
 */
function polygonsFromFlattenedPaths(paths) {
	/**
	 * Iterate over the returned paths,
	 * to produce an array of polygons.
	 * Each polygon may have many regions (eg shapes with cutouts).
	 *
	 * Regions may mean filled or un-filled areas, something to do with
	 * winding order, I don't fully get it but so far it works...
	 *
	 * TODO: split this out... maybe look into an alternative to flattenSVG?
	 * I imagine ClipperJS might be able to handle the flattening...
	 * probably worth looking into.
	 */
	const polygons = [];
	let regions = [];
	let currentGroupId = null;
	for (const path of paths) {
		/**
		 * TODO: is groupId still needed here?
		 * Have not implemented any kind of group assignment...
		 * But somehow things still seem to work?
		 */
		const { groupId, points: rawPoints } = path;
		// TODO: should maybe expose reducedClusteredPoints arg, since it makes
		// a pretty big difference?
		const points = reduceClusteredPoints(rawPoints, 2);

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
