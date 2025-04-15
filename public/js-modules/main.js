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
function traceResetSettings() {
	document.getElementById("threshold").value = 100;
	document.getElementById("radius").value = 5;
}
window.traceResetSettings = traceResetSettings;

async function traceExecute() {
	// Gather settings
	const threshold = getInputAsInt("threshold");
	const radius = getInputAsInt("radius");
	// Gather elements
	const inputElem = document.getElementById("raw-image");
	const outputElem = document.getElementById("processed-image");
	// Execute
	outputElem.src = await processImage(inputElem.src, radius, threshold);
}
window.traceExecute = traceExecute;
