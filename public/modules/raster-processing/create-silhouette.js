import { Jimp } from "./jimp/index.js";

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
	 * Load the original image
	 *
	 * TODO: could probably clean up scaling here?
	 * Maybe it should be a separate step?
	 * Maybe the "padding" part should be a separate step too?
	 */
	const loadedImage = await Jimp.read(imageSrc);
	const widthOriginal = loadedImage.bitmap.width;
	const heightOriginal = loadedImage.bitmap.height;
	const maxImgDimension = Math.max(widthOriginal, heightOriginal);
	const scaleFactor = resizeMax / maxImgDimension;
	loadedImage.resize({
		w: scaleFactor * widthOriginal,
		h: scaleFactor * heightOriginal,
	});
	// loadedImage.contain({ w: resizeMax, h: resizeMax });
	const widthContained = loadedImage.bitmap.width;
	const heightContained = loadedImage.bitmap.height;
	/**
	 * Create a flattened background image
	 * Note we add width and height to account for blur space.
	 */
	const blurExtension = Math.ceil(blurAmount * 4);
	const width = widthContained + blurExtension * 2;
	const height = heightContained + blurExtension * 2;

	const flatBg = new Jimp({ width, height, color: 0xffffffff });
	/**
	 * Composite the loaded image onto the flat background.
	 * Note we add x,y positioning to account for blur space.
	 */
	const compositePosition = { x: blurExtension, y: blurExtension };
	flatBg.composite(loadedImage, compositePosition.x, compositePosition.y);
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
	const flatBgBase64 = await flatBg.getBase64("image/jpeg");
	const thresholdBase64 = await thresholdMask.getBase64("image/jpeg");
	/**
	 * Return both the images
	 */
	return {
		flatBgBase64,
		thresholdBase64,
		widthOriginal,
		heightOriginal,
		scaleFactor,
		width,
		height,
		blurExtension,
	};
}
