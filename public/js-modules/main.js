// COMMON
import { getInputAsInt } from "/js-modules/modules/00-common/get-input-as-int.js";
// UPLOAD
import { onImageSelection } from "/js-modules/modules/01-upload/on-image-selection.js";
// SILHOUETTE
import { processImage } from "/js-modules/modules/02-silhouette/process-image.js";

/**
 * UPLOAD
 */
window.onImageSelection = onImageSelection;

/**
 * SILHOUETTE
 */
function silhouetteResetSettings() {
	document.getElementById("threshold").value = 100;
	document.getElementById("radius").value = 5;
}
window.silhouetteResetSettings = silhouetteResetSettings;

async function silhouetteExecute(imgSrcId, imgDestId) {
	// Gather settings
	const threshold = getInputAsInt("threshold");
	const radius = getInputAsInt("radius");
	// Gather elements
	const inputElem = document.getElementById(imgSrcId);
	const outputElem = document.getElementById(imgDestId);
	// Execute
	/**
	 * TODO: should maybe pad the silhouette image extra?
	 * That way, we'd account for `offset` in one go.
	 * Might make later calculations related to placing the original
	 * image correctly a little easier.
	 */
	outputElem.src = await processImage(inputElem.src, radius, threshold);
}
window.silhouetteExecute = silhouetteExecute;

/**
 * TRACE
 *
 * TODO: improve curve flattening.
 * Have `demo-flatten-svg` for this.
 * Note that flattenSvg takes in an SVG element.
 * So, probably fine to keep existing workflow of writing to SVG element.
 *
 * If you ever get concerned about visible thrash, you could
 * run the whole process in a hidden SVG element, I think... falttenSvg
 * seems to walk the DOM, doesn't seem to rely on the element being
 * visibly rendered.
 */
function traceExecute(imgElemId, svgContainerId) {
	console.log("traceExecute");
	/**
	 * NOTE: uses https://github.com/jankovicsandras/imagetracerjs
	 */
	const pathomit = getInputAsInt("pathomit");
	// Adding custom palette. This will override numberofcolors.
	// Loading an image, tracing with the 'posterized2' option preset, and appending the SVG to an element with id=svgContainerId
	const imageSource = document.getElementById(imgElemId).getAttribute("src");
	/**
	 * Set up function to run after tracing is complete
	 * TODO: this could be an argument to traceExecute()?
	 *
	 * @param {*} svgString
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
		// Clean up SVG
		cleanupTrace(svgContainerElem);
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
			roundcoords: 2,
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
}
window.traceExecute = traceExecute;

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
	 * TODO: the `polygons` variable has the polygon data
	 * that might be appropriate to pass to the next step!
	 */

	let viewBoxString = svgElem.getAttribute("viewBox");
	if (!viewBoxString) {
		const svgWidth = svgElem.getAttribute("width");
		const svgHeight = svgElem.getAttribute("height");
		viewBoxString = `0 0 ${svgWidth} ${svgHeight}`;
	}
	const viewBox = viewBoxString.split(" ").map((s) => parseFloat(s));
	const svgStringAll = renderPolygonsAsPathSvg(polygons, viewBox);
	//
	svgContainerElem.innerHTML = svgStringAll;
}
