import { pathDataStringsFromTraceData } from "./imagetracejs-remixes/path-data-strings-from-trace-data.js";
import { flattenPathDataStrings } from "../vector-processing/flatten-path-data-strings.js";

/**
 * JSDOC type for a loaded Jimp image
 *
 * @typedef {import("./jimp/index.js").Jimp} JimpImage
 */

/**
 * Given a Jimp image, and a pathomit value which sets the minimum
 * size of traced feature to be included,
 * Return <path /> data strings representing a traced version
 * of the image.
 *
 * Note that we expect the incoming Jimp image to be a black
 * silhouette, on a white background. We trace and return the
 * foreground black shapes only.
 *
 * @param {JimpImage} pathomit
 * @returns {Promise<{
 *  polygons: { regions: [number, number][][] }[],
 * 	viewBox: [number, number, number, number],
 * }>}
 */
export async function traceImageData(jimpImage, pathomit) {
	return new Promise((resolve, reject) => {
		// Convert the Jimp image to a Uint8ClampedArray
		const imageDataArray = new Uint8ClampedArray(jimpImage.bitmap.data);
		const { width, height } = jimpImage.bitmap;
		// Create a new ImageData object
		const imageDataObj = new ImageData(imageDataArray, width, height);
		// Gather settings for the trace
		const foregroundColor = { r: 0, g: 0, b: 0, a: 255 };
		const backgroundColor = { r: 245, g: 245, b: 245, a: 255 };
		const traceSettings = {
			pathomit,
			// I don't have tons of experience with these settings, this seems to work
			ltres: 1,
			qtres: 1,
			colorsampling: 0,
			colorquantcycles: 1,
			strokewidth: 0,
			roundcoords: 3,
			/**
			 * Set a custom palette, of:
			 * - black (foreground shapes)
			 * - nearly-white (background shapes, will remove in later step)
			 */
			pal: [foregroundColor, backgroundColor],
		};
		// Trace the image
		const traceData = ImageTracer.imagedataToTracedata(
			imageDataObj,
			traceSettings
		);
		/**
		 * Convert the traced data to path data strings.
		 */
		const pathDataStrings = pathDataStringsFromTraceData(
			traceData,
			traceSettings,
			(data, layerIdx, pathIdx) => {
				// Filter out "hole" paths, these are marked by ImageTracer JS
				const isHolePath = data.layers[layerIdx][pathIdx].isholepath;
				// Filter out "background" paths, we marked these with a custom palette
				const isBackgroundPath = data.palette[layerIdx].r === backgroundColor.r;
				return !isBackgroundPath && !isHolePath;
			}
		);
		/**
		 * Convert the path data strings to polygons
		 *
		 * Note: this approach probably only works for tracing with the specific
		 * settings above, with a two-color palette, which includes a background
		 * color that we ignore and filter out.
		 */
		const polygons = flattenPathDataStrings(pathDataStrings);
		// Resolve with path data strings, and dimensions of the SVG bounds
		resolve({
			polygons,
			viewBox: [0, 0, traceData.width, traceData.height],
		});
	});
}
