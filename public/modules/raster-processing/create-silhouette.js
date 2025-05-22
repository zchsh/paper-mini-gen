import { Jimp } from "./jimp/index.js";
import { flattenImage } from "./flatten-image.js";

/**
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
	/**
	 * Scale the image
	 * TODO: split this out to resize-image-contain
	 */
	const loadedImage = await Jimp.read(imageSrc);
	const widthOriginal = loadedImage.bitmap.width;
	const heightOriginal = loadedImage.bitmap.height;
	const maxImgDimension = Math.max(widthOriginal, heightOriginal);
	const scaleBeforeSilhouette = resizeMax / maxImgDimension;
	loadedImage.resize({
		w: scaleBeforeSilhouette * widthOriginal,
		h: scaleBeforeSilhouette * heightOriginal,
	});
	// Flatten the image, adding padding to account for blur
	const blurExtension = Math.ceil(blurAmount * 4);
	const flatBg = await flattenImage(loadedImage, {
		padding: {
			top: blurExtension,
			left: blurExtension,
			bottom: blurExtension,
			right: blurExtension,
		},
		backgroundColor: 0xffffffff,
	});
	/**
	 * Create a threshold image
	 */
	const thresholdMask = flatBg.clone();
	if (blurAmount > 0) {
		thresholdMask.blur(blurAmount);
	}
	// Invert so the subject to silhouette is light
	thresholdMask.invert();
	// Replace any light pixels that meet the threshold with white pixels
	thresholdMask.threshold({ max: 255 - threshold });
	// Invert the image again, now the high-contrast white silhouette is black
	thresholdMask.invert();
	// There will still be gray pixels, replace any gray pixels with white
	thresholdMask.threshold({ max: 1, replace: 255 });
	/**
	 * Convert the created iamges to base64
	 */
	const silhouetteBase64 = await thresholdMask.getBase64("image/jpeg");
	/**
	 * Return both the images
	 */
	return {
		/**
		 * TODO: split out process of getting `sizeOriginal`?
		 * doesn't feel all that relevant to this function.
		 */
		sizeOriginal: { width: widthOriginal, height: heightOriginal },
		scaleBeforeSilhouette,
		blurExtension,
		silhouetteBase64,
	};
}
