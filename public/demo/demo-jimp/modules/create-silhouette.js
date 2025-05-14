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
 * @returns {Promise<string[]>} - A promise that resolves to a tuple of two
 * base64 encoded image strings.
 */
export async function createSilhouette(imageSrc, blurAmount, threshold) {
	/**
	 * Load the original image
	 */
	const loadedImage = await Jimp.read(imageSrc);
	const width = loadedImage.bitmap.width;
	const height = loadedImage.bitmap.height;
	/**
	 * Create a flattened background image
	 * Note we add width and height to account for blur space.
	 */
	const blurExtension = Math.ceil(blurAmount * 4);
	const flatBg = new Jimp({
		width: width + blurExtension * 2,
		height: height + blurExtension * 2,
		color: 0xffffffff,
	});
	/**
	 * Composite the loaded image onto the flat background.
	 * Note we add x,y positioning to account for blur space.
	 */
	flatBg.composite(loadedImage, blurExtension, blurExtension);
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
	return [flatBgBase64, thresholdBase64];
}
