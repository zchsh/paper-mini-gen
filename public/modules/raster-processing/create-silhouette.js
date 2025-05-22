import { Jimp } from "./jimp/index.js";
import { flattenImage } from "./flatten-image.js";
import { containImage } from "./contain-image.js";
import { thresholdImage } from "./threshold-image.js";
import { getImageSize } from "./get-image-size.js";

/**
 * TODO: refactor to accept a JimpImage instead of a string.
 * Maybe could also return a JimpImage?
 *
 * Given an image source, a blur amount, and a threshold,
 * Return a version of the original image and the silhouette
 * in a tuple of base64 encoded strings.
 *
 * NOTE: this function requires the Jimp library to exist in the global scope.
 *
 * @param {string} imageSrc - The source of the image to be processed.
 * @param {number} blurAmount - The amount of blur to apply to the image.
 * @param {number} threshold - The threshold value for the silhouette effect.
 * @param {number} resizeMax - The size of a containing square to resize the image into before processing.
 * @returns {Promise<string[]>} - A promise that resolves to a tuple of two
 * base64 encoded image strings.
 */
export async function createSilhouette(
	imageSrc,
	blurAmount,
	threshold,
	resizeMax
) {
	// Scale the image to contain it in a square of the provided size
	const imageLoaded = await Jimp.read(imageSrc);
	const [scaledImage, scaleFactor] = await containImage(imageLoaded, resizeMax);
	// Flatten the image, adding padding to account for blur
	const padding = Math.ceil(blurAmount * 4);
	const imageFlat = await flattenImage(scaledImage, { padding });
	// Apply a blur to the image, if applicable
	if (blurAmount > 0) {
		imageFlat.blur(blurAmount);
	}
	// Apply a threshold to the image
	const imageThreshold = await thresholdImage(imageFlat, threshold);
	// Return a bundle of stuff
	// TODO: maybe unbundle this?
	return {
		sizeOriginal: getImageSize(imageLoaded),
		scaleBeforeSilhouette: scaleFactor,
		blurExtension: padding,
		silhouetteBase64: await imageThreshold.getBase64("image/jpeg"),
	};
}
