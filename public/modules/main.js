// COMMON
import { getInputAsInt } from "/modules/00-common/get-input-as-int.js";
import { copyTextToClipboard } from "/modules/00-common/copy-text-to-clipboard.js";
// UPLOAD
import { resetSettings } from "/modules/01-upload/reset-settings.js";
// SILHOUETTE
import { createSilhouette } from "/modules/raster-processing/create-silhouette.js";
// TRACE
import { traceImage } from "/modules/raster-processing/trace-image.js";
// OFFSET
import { applyOffset } from "/modules/vector-processing/apply-offset.js";
// ARRANGE
import { arrangeForUnion } from "./layout/arrange-for-union.js";
import { applyUnion } from "./vector-processing/apply-union.js";
import { applyLayout } from "./layout/apply-layout.js";
// GLOBAL STUFF
import { onImageSelection } from "/modules/01-upload/on-image-selection.js";
import { updateImage } from "/modules/upload/update-image.js";

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
	// Gather image source and settings for silhouette
	const inputSrc = document.getElementById("raw-image").src;
	const imgResizeMax = 400;
	const threshold = getInputAsInt("threshold");
	const radius = getInputAsInt("radius");

	/**
	 * Create the silhouette
	 *
	 * TODO maybe split out the scaling step as a separate thing?
	 */
	const {
		sizeOriginal,
		scaleBeforeSilhouette,
		blurExtension,
		silhouetteBase64,
	} = await createSilhouette(inputSrc, radius, threshold, imgResizeMax);

	// Render the silhouette
	const silhouetteImgElem = document.getElementById("processed-image");
	silhouetteImgElem.src = silhouetteBase64;

	const cleanTracePolygons = await traceImage("processed-image", "trace-svg");
	const [polygons_offset, offset] = applyOffset(
		"trace-svg",
		"offset-svg",
		cleanTracePolygons
	);
	const {
		polygons_arranged,
		scale: scalePostTrace,
		baseSize,
		baseOverlap,
		boundingWidth,
		boundingHeight,
		boundingBox,
		arrangeOffset,
		reflectedPolygonOffsetY,
		baseCenters,
	} = arrangeForUnion(
		polygons_offset,
		document.getElementById("arrange-container")
	);
	const polygons_union = applyUnion(
		polygons_arranged,
		"union-container"
		// "union-shapes-debug",
		// "union-arrange-debug"
	);
	// TODO: grab polygon width and height, probs from "arrange for union"
	await applyLayout(
		polygons_union,
		{
			blurExtension,
			scaleBeforeSilhouette,
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
