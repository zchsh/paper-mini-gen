import { createSvgElem } from "../render/create-svg-elem.js";
import { reduceClusteredPoints } from "./reduce-clustered-points.js";
import { cleanRegions } from "./clipperjs-wrappers/clean-regions.js";
import { simplifyRegions } from "./clipperjs-wrappers/simplify-regions.js";
import { flattenSVG } from "./flatten-svg/svg-to-paths.js";

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
	 *
	 * Note that we ignore grouping here. Our `polygons` format can contain
	 * multiple regions in a single polygon, so we interpret all paths
	 * as being part of the same polygon.
	 */
	const polygons = [{ regions: flattenSvgResult.map((entry) => entry.points) }];
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
