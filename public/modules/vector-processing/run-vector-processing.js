// COMMON
import { getInputAsInt } from "../ui/get-input-as-int.js";
// VECTOR processing
import { applyOffset } from "./apply-offset.js";
import { applyUnion } from "./clipperjs-wrappers/apply-union.js";
// LAYOUT
import { arrangeForUnion } from "../layout/arrange-for-union.js";
import { layoutFinalSvg } from "../layout/layout-final-svg.js";
import { scaleToTargetHeight } from "../layout/scale-to-target-height.js";
// CACHEING RESULTS
import { getCachedResult } from "../util/cache-result.js";
// RASTER processing, which is a pre-requisite and MIGHT have to be run
import { runRasterProcessing } from "../raster-processing/run-raster-processing.js";

/**
 * Runs vector processing on a set of traced polygons, to produce
 * a piece of SVG artwork that can be printed and assembled
 * into a paper miniature.
 *
 * Relies on the DOM meeting the following requirements:
 * - An input element with id "heightMm" is present, which specifies the
 *   target height in mm.
 * - An input element with id "offset" is present, which specifies the outline
 *   width to add to the traced polygons.
 * - An input element with id "baseSizeMm" is present, which specifies the
 *   base size in mm.
 * - An input element with id "arrangeOffsetX" is present, which specifies the
 *   "centering" value in the X direction for arranging the polygons.
 * - An input element with id "arrangeOffsetY" is present, which specifies the
 *   "float" value in the Y direction for arranging the polygons.
 * - An element with id "layout-container" is present, which will be used to
 *   render the final SVG layout.
 * - An element with id "download-link-container" is present, which will be used
 *   to render the download link for the final SVG.
 *
 * @param {Object} [imageMetricsArg] - Optional argument containing image metrics.
 */
export async function runVectorProcessing(imageMetricsArg) {
	const imageMetrics =
		imageMetricsArg ||
		getCachedResult("imageMetrics") ||
		(await runRasterProcessing());
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
	/**
	 * TODO: treat arrangeOffsetX as a percent of the width of the traced polygons
	 */
	const arrangeOffsetX = getInputAsInt("arrangeOffsetX");
	/**
	 * TODO: treat arrangeOffsetY as a percent of the height of the traced polygons
	 */
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
	const finalSvgElem = await layoutFinalSvg(polygons_union, imgData, {
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
