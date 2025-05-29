// COMMON
import { getInputAsInt } from "./00-common/get-input-as-int.js";
import { copyTextToClipboard } from "./00-common/copy-text-to-clipboard.js";
// UPLOAD
import { resetSettings } from "./01-upload/reset-settings.js";
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
import { applyUnion } from "./vector-processing/apply-union.js";
import { applyLayout } from "./layout/apply-layout.js";
// GLOBAL STUFF
import { onImageSelection } from "./01-upload/on-image-selection.js";
import { updateImage } from "./upload/update-image.js";
import { scaleToTargetHeight } from "./layout/scale-to-target-height.js";
import { getFallbackViewBox } from "./render/get-fallback-viewbox.js";

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
	/**
	 * Offset the traced polygons
	 */
	const offset = getInputAsInt("offset");
	const polygonsOffset = applyOffset(traceResult.polygons, offset);
	// Render the offset polygons
	const destNodeOffset = document.getElementById("offset-svg");
	const viewBoxOffset = [
		traceResult.viewBox[0] - offset,
		traceResult.viewBox[1] - offset,
		traceResult.viewBox[2] + offset * 2,
		traceResult.viewBox[3] + offset * 2,
	];
	const svgNodeFlattened = svgNodeFromPolygons(polygonsOffset, viewBoxOffset, {
		showDebug: true,
	});
	destNodeOffset.innerHTML = "";
	destNodeOffset.appendChild(svgNodeFlattened);
	/**
	 * Scale the polygons to a target height
	 */
	const heightInputMm = getInputAsInt("heightMm");
	const [polygonsScaled, scalePostTrace] = scaleToTargetHeight(
		polygonsOffset,
		heightInputMm
	);
	/**
	 * Arrange the offset trace and base shapes for a union operation.
	 * This union shape will be the cut-out outline for the paper miniature.
	 */
	const baseSizeMm = getInputAsInt("baseSizeMm");
	const arrangeOffsetX = getInputAsInt("arrangeOffsetX");
	const arrangeOffsetY = getInputAsInt("arrangeOffsetY");
	const [polygonsArranged, baseData] = arrangeForUnion(polygonsScaled, {
		baseSizeMm,
		arrangeOffsetX,
		arrangeOffsetY,
	});
	/**
	 * Render the shapes arranged for a union
	 */
	const arrangeContainer = document.getElementById("arrange-container");
	const viewBoxArrangePadding = 9; // 1/8 inch
	const viewBoxArrange = getFallbackViewBox(
		polygonsArranged,
		viewBoxArrangePadding
	);
	const svgNodeArranged = svgNodeFromPolygons(polygonsArranged, viewBoxArrange);
	arrangeContainer.innerHTML = "";
	arrangeContainer.appendChild(svgNodeArranged);
	/**
	 * Apply union to the arranged polygons
	 */
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
			blurPadding,
			scalePreTrace,
			scalePostTrace,
			sizeOriginal,
			baseData,
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
