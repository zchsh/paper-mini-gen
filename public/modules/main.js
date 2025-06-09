// COMMON
import { copyTextToClipboard } from "./ui/copy-text-to-clipboard.js";
// UPLOAD
import { resetSettings } from "./ui/reset-settings.js";
// GLOBAL STUFF
import { onImageSelection } from "./ui/on-image-selection.js";
import { updateImage } from "./upload/update-image.js";
import { debounce } from "./ui/debounce.js";
// RASTER PROCESSING
import { runRasterProcessing } from "./raster-processing/run-raster-processing.js";
// VECTOR PROCESSING
import { runVectorProcessing } from "./vector-processing/run-vector-processing.js";

/**
 * Run raster processing, which generates a silhouette from the input image,
 * then run vector processing, which generates the final SVG layout
 * for the paper miniature.
 */
async function runAll() {
	// Run all raster related processing
	const imageMetrics = await runRasterProcessing();
	// Run all vector related processing
	await runVectorProcessing(imageMetrics);
}

async function resetAndRunAll() {
	resetSettings();
	await runAll();
}

// Raster processing is a bit slow, we debounce to try not to waste resources
const handleRasterEffect = debounce(runAll, 250);
// Vector processing is pretty fast, it can happen more often
const handleVectorEffect = debounce(runVectorProcessing, 10);

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
