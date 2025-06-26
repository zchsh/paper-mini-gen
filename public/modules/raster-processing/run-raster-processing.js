// COMMON
import { getInputAsInt } from "../ui/get-input-as-int.js";
// RASTER functions
import { Jimp } from "./jimp/index.js";
import { flattenImage } from "./flatten-image.js";
import { containImage } from "./contain-image.js";
import { thresholdImage } from "./threshold-image.js";
import { getImageSize } from "./get-image-size.js";
import { traceImageData } from "./trace-image-data.js";
// RENDER functions
import { svgNodeFromPolygons } from "../render/svg-node-from-polygons.js";
import { toDataUrl } from "../render/to-data-url.js";
// CACHE
import { setCachedResult } from "../util/cache-result.js";

/**
 * Runs raster processing on an input image to generate a silhouette,
 * which is then traced to produce polygons that can be used for
 * further vector processing.
 *
 * Relies on the DOM meeting the following requirements:
 * - An image element with id "raw-image" is present,
 *   which will be used as the input image.
 * - An input element with id "threshold" is present,
 *   which specifies the threshold value for silhouette generation.
 * - An input element with id "radius" is present,
 *   which specifies the blur radius to apply to the image before thresholding.
 * - An input element with id "pathomit" is present,
 *   which specifies what size of traced shape should be filtered out.
 * - An image element with id "processed-image" is present,
 *   which will be used to render the silhouette image.
 * - An element with id "trace-svg" is present,
 *   which will be used to render the traced polygons as an SVG.
 */
export async function runRasterProcessing(inputSrc, inputBasename) {
	// Load the input image
	// const inputSrc = document.getElementById("raw-image").src;
	const inputImage = await Jimp.read(inputSrc);
	// Get settings for the silhouette
	const threshold = getInputAsInt("threshold");
	const radius = getInputAsInt("radius");
	// Scale the image before creating the silhouette
	const sizeOriginal = getImageSize(inputImage);
	const size = 400;
	const [scaledImage, scalePreTrace] = await containImage(inputImage, size);
	// Flatten the image, adding padding to account for potential blurring
	const blurPadding = Math.ceil(radius * 4);
	const imageFlat = await flattenImage(scaledImage, { padding: blurPadding });
	// Apply a blur to the image, if applicable
	if (radius > 0) imageFlat.blur(radius);
	// Apply a threshold to the image, creating the silhouette
	const silhouetteImage = await thresholdImage(imageFlat, threshold);
	// Render the silhouette image
	const destNodeSilhouette = document.getElementById("processed-image");
	destNodeSilhouette.src = await silhouetteImage.getBase64("image/jpeg");
	/**
	 * Trace the silhouette image data
	 */
	const pathomit = getInputAsInt("pathomit");
	const traceResult = await traceImageData(silhouetteImage, pathomit);
	// Render the traced polygons
	const svgPolygonsTraced = svgNodeFromPolygons(
		traceResult.polygons,
		traceResult.viewBox,
		{ showDebug: true }
	);
	const destNodeTrace = document.getElementById("trace-svg");
	destNodeTrace.innerHTML = "";
	destNodeTrace.appendChild(svgPolygonsTraced);
	// Grab the image as a data URL
	const imageElem = document.getElementById("raw-image");
	const imgData = {
		dataUrl: await toDataUrl(imageElem.getAttribute("src")),
		height: imageElem.naturalHeight,
		width: imageElem.naturalWidth,
	};
	// Bundle the relevant image metrics
	const imageMetrics = {
		traceResult,
		blurPadding,
		sizeOriginal,
		scalePreTrace,
		imgData,
	};
	if (inputBasename) {
		imageMetrics.imageBasename = inputBasename;
	} else if (window.results?.imageMetrics) {
		// If we have a previous imageMetrics, use its basename
		imageMetrics.imageBasename = window.results?.imageMetrics.imageBasename;
	}
	// Store the raster related processing results on the window object
	setCachedResult("imageMetrics", imageMetrics);
	// Return relevant image metrics
	return imageMetrics;
}
