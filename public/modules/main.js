// COMMON
import { getInputAsInt } from "/modules/00-common/get-input-as-int.js";
import { copyTextToClipboard } from "/modules/00-common/copy-text-to-clipboard.js";
// UPLOAD
import { resetSettings } from "/modules/01-upload/reset-settings.js";
// SILHOUETTE
import { Jimp } from "./raster-processing/jimp/index.js";
import { flattenImage } from "./raster-processing/flatten-image.js";
import { containImage } from "./raster-processing/contain-image.js";
import { thresholdImage } from "./raster-processing/threshold-image.js";
import { getImageSize } from "./raster-processing/get-image-size.js";
// TRACE
import { traceImage } from "/modules/raster-processing/trace-image.js";
import { traceImageData } from "./raster-processing/trace-image-data.js";
// OFFSET
import { applyOffset } from "/modules/vector-processing/apply-offset.js";
// ARRANGE
import { arrangeForUnion } from "./layout/arrange-for-union.js";
import { applyUnion } from "./vector-processing/apply-union.js";
import { applyLayout } from "./layout/apply-layout.js";
// GLOBAL STUFF
import { onImageSelection } from "/modules/01-upload/on-image-selection.js";
import { updateImage } from "/modules/upload/update-image.js";
import { renderPathDataStrings } from "./render/render-path-data-strings.js";

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
 *
 * TODO: all these variables being passed around are a bit of a mess.
 * Would be great to simplify and clean up, I think that'll large
 * come naturally from refactoring each individual function.
 */
async function runAll() {
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
	const padding = Math.ceil(radius * 4);
	const blurExtension = padding;
	const imageFlat = await flattenImage(scaledImage, { padding });
	// Apply a blur to the image, if applicable
	if (radius > 0) imageFlat.blur(radius);
	// Apply a threshold to the image, creating the silhouette
	const silhouetteImage = await thresholdImage(imageFlat, threshold);
	// Render the silhouette image
	/**
	 * TODO: tracing picks up the rendered silhouette image...
	 * would it be possible to pass it directly? Must be right?
	 */
	const silhouetteImgElem = document.getElementById("processed-image");
	silhouetteImgElem.src = await silhouetteImage.getBase64("image/jpeg");
	/**
	 * TODO: stubbed alternate in, not working yet
	 */
	const pathomit = getInputAsInt("pathomit");
	const devTraceData = await traceImageData(silhouetteImage, pathomit);
	const devWidth = devTraceData.width;
	const devHeight = devTraceData.height;
	console.log({ devTraceData, devWidth, devHeight });
	const devTraceDataSvg = renderPathDataStrings(
		devTraceData.pathDataStrings,
		devTraceData.width,
		devTraceData.height
	);
	console.log({ devTraceData, devTraceDataSvg });
	// TODO: uncomment line below to see a preview of the traced path strings
	// document.body.appendChild(devTraceDataSvg);
	// Trace the silhouette image
	const cleanTracePolygons = await traceImage("processed-image", "trace-svg");
	// Offset the traced polygons
	const offset = getInputAsInt("offset");
	const polygons_offset = applyOffset(
		"trace-svg",
		"offset-svg",
		cleanTracePolygons,
		offset
	);
	const {
		baseCenters,
		baseOverlap,
		baseSize,
		polygonsArranged,
		scalePostTrace,
	} = arrangeForUnion(
		polygons_offset,
		document.getElementById("arrange-container")
	);
	const polygons_union = applyUnion(
		polygonsArranged,
		"union-container"
		// "union-shapes-debug",
		// "union-arrange-debug"
	);
	// TODO: grab polygon width and height, probs from "arrange for union"
	await applyLayout(
		polygons_union,
		{
			blurExtension,
			scalePreTrace,
			scalePostTrace,
			heightOriginal: sizeOriginal.height,
			baseSize,
			baseOverlap,
			baseCenters,
		},
		"layout-container"
	);
}

async function resetAndRunAll() {
	resetSettings();
	await runAll();
}

/**
 * GLOBAL FUNCTION ASSIGNMENT
 */
window.copyTextToClipboard = copyTextToClipboard;
window.onImageSelection = onImageSelection;
window.resetAndRunAll = resetAndRunAll;
window.runAll = runAll;
window.updateImage = updateImage;
