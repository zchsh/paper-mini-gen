import { getInputAsInt } from "/modules/00-common/get-input-as-int.js";
import { parseSvgViewbox } from "/modules/04-offset/parse-svg-viewbox.js";
import { reduceClusteredPoints } from "/modules/03-trace/reduce-clustered-points.js";
import { cleanRegions } from "/modules/clipperjs-wrappers/clean-regions.js";
import { simplifyRegions } from "/modules/clipperjs-wrappers/simplify-regions.js";
import { svgNodeFromPolygons } from "../render/svg-node-from-polygons.js";

/**
 * TRACE
 *
 * Traces the `img` element specified by `imgElemId`
 * and appends theresulting SVG to the `svgContainerId` element.
 *
 * TODO: split out this function, along with cleanupTrace, to its own module
 */
export async function traceImage(imgElemId, svgContainerId) {
	return new Promise((resolve, reject) => {
		/**
		 * NOTE: uses https://github.com/jankovicsandras/imagetracerjs
		 */
		const pathomit = getInputAsInt("pathomit");
		// Adding custom palette. This will override numberofcolors.
		// Loading an image, tracing with the 'posterized2' option preset, and appending the SVG to an element with id=svgContainerId
		const imageSource = document.getElementById(imgElemId).getAttribute("src");
		/**
		 * Set up function to run after tracing is complete
		 * TODO: this could be an argument to trace()?
		 *
		 * @param {string} svgString
		 */
		function doneTracingCallback(svgString) {
			const svgContainerElem = document.getElementById(svgContainerId);
			/**
			 * TODO: does `ImageTracer` really need to be used here?
			 * Could you just do:
			 * svgContainerElem.innerHTML = svgString;
			 */
			svgContainerElem.innerHTML = "";
			ImageTracer.appendSVGString(svgString, svgContainerId);
			// Clean up SVG, the `cleanupTrace` function also renders it out to DOM
			const cleanTracePolygons = cleanupTrace(svgContainerElem);
			// Resolve with the cleaned up polygons
			resolve(cleanTracePolygons);
		}
		/**
		 * TODO: is there a way to trace with straight lines only?
		 * Could simplify the process dramatically...
		 */
		ImageTracer.imageToSVG(
			imageSource /* input filename / URL */,
			doneTracingCallback,
			{
				pathomit,
				ltres: 1,
				qtres: 1,
				colorsampling: 0,
				colorquantcycles: 1,
				strokewidth: 0,
				roundcoords: 3,
				/**
				 * Set a custom palette, of:
				 * - black (foreground shapes)
				 * - nearly-white (background shapes, will remove in later step)
				 */
				pal: [
					{ r: 0, g: 0, b: 0, a: 255 },
					{ r: 245, g: 245, b: 245, a: 255 },
				],
			}
		);
	});
}

/**
 * TRACE - CLEANUP, CONVERT TO POLYGON
 *
 * TODO: ensure you're using the polygon conversion method that you like!
 * I THINK I might still be using the old method... new method has
 * curve flattening, which I think really helps!
 */
function cleanupTrace(svgContainerElem) {
	/**
	 * Retain only the "foreground" paths.
	 *
	 * We only want to outline and boolean add the traced paths
	 * that are "foreground" (ie black). Speficially, remove paths with
	 * `fill="rgb(245,245,245)"`. Note this specific colour was set
	 * in the palette of the trace in an earlier step.
	 */
	svgContainerElem
		.querySelectorAll(`path[fill="rgb(245,245,245)"]`)
		.forEach((e) => e.remove());
	/**
	 * Convert the foreground paths, which may include curves,
	 * to polygons, which will consist of straigh lines only.
	 */
	// Flatten the SVG into an array of paths
	const svgElem = svgContainerElem.querySelector("svg");
	const paths = flattenSVG(svgElem);
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
		const points = reduceClusteredPoints(rawPoints, 3);

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
	 * Clean up with ClipperJS
	 */
	const polygonsCleaned = polygons.map((polygon) => {
		const regionsCleaned = cleanRegions(polygon.regions, 0.2);
		const regionsSimplified = simplifyRegions(regionsCleaned);
		return { regions: regionsSimplified };
	});

	const showDebugPoints = true; // enable to see the issue above
	const viewBox = parseSvgViewbox(svgElem);
	const svgNodeAll = svgNodeFromPolygons(polygonsCleaned, viewBox, {
		showDebug: showDebugPoints,
	});
	svgContainerElem.innerHTML = "";
	svgContainerElem.appendChild(svgNodeAll);

	return polygonsCleaned;
}
