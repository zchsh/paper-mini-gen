// COMMON
import { getInputAsInt } from "./ui/get-input-as-int.js";
import { copyTextToClipboard } from "./ui/copy-text-to-clipboard.js";
// UPLOAD
import { resetSettings } from "./ui/reset-settings.js";
// SILHOUETTE
import { Jimp } from "./raster-processing/jimp/index.js";
import { flattenImage } from "./raster-processing/flatten-image.js";
import { containImage } from "./raster-processing/contain-image.js";
import { thresholdImage } from "./raster-processing/threshold-image.js";
import { getImageSize } from "./raster-processing/get-image-size.js";
// TRACE
import { traceImageData } from "./raster-processing/trace-image-data.js";
import { svgNodeFromPolygons } from "./render/svg-node-from-polygons.js";
// OFFSET
import { applyOffset } from "./vector-processing/apply-offset.js";
// ARRANGE
import { arrangeForUnion } from "./layout/arrange-for-union.js";
import { applyUnion } from "./vector-processing/clipperjs-wrappers/apply-union.js";
import { applyLayout } from "./layout/apply-layout.js";
import { toDataUrl } from "./render/to-data-url.js";
// GLOBAL STUFF
import { onImageSelection } from "./ui/on-image-selection.js";
import { updateImage } from "./upload/update-image.js";
import { scaleToTargetHeight } from "./layout/scale-to-target-height.js";
import { getFallbackViewBox } from "./render/get-fallback-viewbox.js";
import { debounce } from "./ui/debounce.js";

/**
 * TODO: refactor so runAll() can start from specific step.
 * Eg, when adjusting `offset`, should re-run from `applyOffset()`
 * onwards, everything before is already done.
 *
 * In fact, there'd even be sub-steps. Eg, when adjusting the "offset"
 * in the "arrange" phase, really only need to re-run PART of a step.
 * That level of optimization could come later... but may be worth
 * thinking through, when you're deciding exactly HOW to refactor.
 * Maybe the answer is just... if you want to break a single step
 * down into two parts, then maybe that step should really be two steps.
 * And for the "arrange" step at least, seems totally fine to do a little
 * extra redundant math WITHIN the step... it'll be wasteful but
 * fast anyways.
 */
async function runAll() {
	// Run all raster related processing
	const imageMetrics = await runAllRaster();
	window.imageMetrics = imageMetrics;
	// Run all vector related processing
	await runAllVector(imageMetrics);
}

/**
 * TODO: write description
 *
 *
 */
async function runAllRaster() {
	// Load the input image
	const inputSrc = document.getElementById("raw-image").src;
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

	// Return relevant image metrics
	return {
		traceResult,
		blurPadding,
		sizeOriginal,
		scalePreTrace,
		imgData,
	};
}

/**
 * TODO: write description
 *
 *
 */
async function runAllVector(imageMetricsArg) {
	const imageMetrics =
		imageMetricsArg || window.imageMetrics || (await runAllRaster());
	const { traceResult, blurPadding, sizeOriginal, scalePreTrace, imgData } =
		imageMetrics;
	/**
	 * Scale the polygons to a target height
	 */
	const heightInputMm = getInputAsInt("heightMm");
	const [polygonsScaled, scalePostTrace] = scaleToTargetHeight(
		traceResult.polygons,
		heightInputMm
	);
	/**
	 * Offset the traced polygons
	 */
	const offset = getInputAsInt("offset");
	const polygonsOffset = applyOffset(polygonsScaled, offset);
	/**
	 * Arrange the offset trace and base shapes for a union operation.
	 * This union shape will be the cut-out outline for the paper miniature.
	 */
	const baseSizeMm = getInputAsInt("baseSizeMm");
	const arrangeOffsetX = getInputAsInt("arrangeOffsetX");
	const arrangeOffsetY = getInputAsInt("arrangeOffsetY");
	const [polygonsArranged, baseData] = arrangeForUnion(polygonsOffset, {
		baseSizeMm,
		arrangeOffsetX,
		arrangeOffsetY,
	});
	/**
	 * Apply union to the arranged polygons
	 */
	const outline_union = applyUnion(polygonsArranged);
	const polygons_union = [outline_union];
	/**
	 * Layout the outline union shape with final print elements,
	 * including the original image, a reverse-side image,
	 * the outline union shape, and fold lines.
	 */
	const finalSvgElem = await applyLayout(polygons_union, imgData, {
		blurPadding,
		scalePreTrace,
		scalePostTrace,
		sizeOriginal,
		baseData,
	});
	// Render the final SVG layout
	const finalContainer = document.getElementById("layout-container");
	finalContainer.innerHTML = "";
	finalContainer.appendChild(finalSvgElem);
	/**
	 * TODO: all the stuff below could be debounced,
	 * doesn't need to happen on every single change,
	 * could happen MUCH less frequently (eg 4 times per second).
	 */
	// Grab the final SVG as a string
	const finalSvgString = new XMLSerializer().serializeToString(finalSvgElem);
	const finalSvgDataUrl = `data:image/svg+xml;base64,${btoa(finalSvgString)}`;
	// Get the current date-time in YYYY-MM-DD_HH-MM-SS format
	const now = new Date();
	const formattedDate = now.toISOString().replace(/[:.]/g, "-").slice(0, 19);
	// Set the download link's href to the final SVG data URL
	const downloadLinkContainer = document.getElementById(
		"download-link-container"
	);
	const downloadLink = document.createElement("a");
	downloadLink.href = finalSvgDataUrl;
	downloadLink.download = `${formattedDate}-paper-miniature.svg`;
	downloadLink.textContent = "Download SVG";
	// Clear previous download links, add the new ones
	downloadLinkContainer.innerHTML = "";
	downloadLinkContainer.appendChild(downloadLink);
}

async function resetAndRunAll() {
	resetSettings();
	await runAll();
}

// Raster processing is a bit slow, we debounce to try not to waste resources
const handleRasterEffect = debounce(runAll, 250);
// Vector processing is pretty fast, it can happen more often
const handleVectorEffect = debounce(runAllVector, 10);

/**
 * GLOBAL FUNCTION ASSIGNMENT
 */
window.copyTextToClipboard = copyTextToClipboard;
window.debounce = debounce;
window.onImageSelection = onImageSelection;
window.resetAndRunAll = resetAndRunAll;
window.runAll = runAll;
window.handleRasterEffect = handleRasterEffect;
window.handleVectorEffect = handleVectorEffect;
window.updateImage = updateImage;
