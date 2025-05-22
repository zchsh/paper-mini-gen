import { Jimp } from "./jimp/index.js";
import { flattenImage } from "./flatten-image.js";
import { containImage } from "./contain-image.js";
import { thresholdImage } from "./threshold-image.js";
import { getImageSize } from "./get-image-size.js";

/**
 * JSDoc definition of the return value of the createSilhouette function.
 * @typedef {Object} CreateSilhouetteResult
 * @property {{ width: number, height: number}} sizeOriginal - The original size of the image.
 * @property {number} scaleBeforeSilhouette - The scale factor used to resize the image.
 * @property {number} blurExtension - The amount of padding added to the image for blur.
 * @property {string} silhouetteBase64 - The base64 encoded silhouette image.
 */

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
 * @param {JimpImage} imageSrc - The source of the image to be processed.
 * @param {number} blurAmount - The amount of blur to apply to the image.
 * @param {number} threshold - The threshold value for the silhouette effect.
 * @param {number} size - The size of a containing square to resize the image
 * into before processing.
 * @returns {Promise<CreateSilhouetteResult>} - A promise that resolves to an object
 * containing the original image size, scale factor, blur extension,
 * and the base64 encoded silhouette image.
 */
export async function createSilhouette(
	jimpImage,
	{ threshold, radius, padding }
) {
	// Flatten the image, adding padding to account for blur

	const imageFlat = await flattenImage(jimpImage, { padding });
	// Apply a blur to the image, if applicable
	if (radius > 0) {
		imageFlat.blur(radius);
	}
	// Apply a threshold to the image
	const imageThreshold = await thresholdImage(imageFlat, threshold);
	// Return a bundle of stuff
	// return {
	// 	sizeOriginal: getImageSize(imageLoaded),
	// 	scaleBeforeSilhouette: scaleFactor,
	// 	blurExtension: padding,
	// 	silhouetteBase64: await imageThreshold.getBase64("image/jpeg"),
	// };
	return imageThreshold;
}
