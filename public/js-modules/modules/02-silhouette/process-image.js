import { applyThreshold } from "./apply-threshold.js";
import { getFallbackThreshold } from "./get-fallback-threshold.js";

/**
 * NOTE: expects `IJS` to be defined globally, by image-js:
 * https://www.lactame.com/lib/image-js/0.21.2/image.min.js
 *
 * TODO (later): for transparent images,
 * somehow apply a white background before processing?
 * This should happen before auto-threshold, and before
 * applyThreshold as well.
 *
 * Until then, only support `.jpg`, not `.png`?
 *
 * Maybe helpful link:
 * https://github.com/image-js/image-js/issues/485#issuecomment-508472868
 *
 * @param {*} imgSrc
 * @param {*} radius
 * @param {*} threshold
 * @returns
 */
export async function processImage(imgSrc, radius, threshold) {
	// Gather optional settings
	const useAuto = threshold === 100;
	let image = await IJS.Image.load(imgSrc);
	const thresholdAuto = await getFallbackThreshold(image);
	const finalThreshold = useAuto ? thresholdAuto : threshold;
	// Process the image
	const processedSrc = await applyThreshold(
		image,
		finalThreshold / 100.0,
		radius
	);
	// Load the image into a destination element
	return processedSrc;
}
