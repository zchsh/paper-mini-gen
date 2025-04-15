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
	outputElem.src = await processImage(inputElem.src, radius, threshold);
}
window.silhouetteExecute = silhouetteExecute;

/**
 * TRACE
 *
 * TODO: in `doneTracingCallback`, should take the SVG string, and parse out
 * the path's points somehow... and flatten and get polygon points?
 * Then return the points from the function, so they can be passed
 * to whatever other utilities come up?
 *
 * TODO: improve curve flattening.
 * Have `demo-flatten-svg` for this.
 * Use 00 example.
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
	 *
	 * The current approach is swiped from:
	 * https://betravis.github.io/shape-tools/path-to-polygon/
	 *
	 * That being said, it doesn't seem to do _any_ sampling along
	 * curves... instead it only keeps the control points. Maybe
	 * it'd be possible to improve the tracing further by combining
	 * the "retain all control points" approach with a
	 * "sample along the line" approach... perhaps sampling along
	 * the line only for curved segments? This is a deep dive though,
	 * and certainly not something I intend to try to tackle at this time.
	 * More the sample-along-the-line approach:
	 * https://phrogz.net/SVG/convert_path_to_polygon.xhtml
	 * And there's a very naive implementation in:
	 * `basic-point-at-length.html` (in this repo)
	 */
	convertPathsToPolygon(svgContainerElem.querySelector("svg"));
}
