/**
 * JSDOC type for a loaded Jimp image
 *
 * @typedef {import("./jimp/index.js").Jimp} JimpImage
 */

/**
 * Given a loaded JimpImage, use a thresholding algorithm to convert all
 * pixels in the image to either black or white, based on the provided
 * threshold value.
 * Return the threshold image as a JimpImage.
 *
 * Note that Jimp's thresholding algorithm seems to work only at one end,
 * replacing light pixels with the specified replacement color and leaving
 * all other pixels unchanged (though a grayscale is automatically applied,
 * for some reason). Reference:
 * https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/#threshold
 *
 * @param {JimpImage} jimpImage - The source of the image to be processed.
 * @param {number} threshold - The threshold value to apply. Should be a number
 * between 0 and 255.
 * @returns {Promise<JimpImage>} - A promise that resolves to a JimpImage
 * representing the image with a bitmap threshold applied.
 */
export async function thresholdImage(jimpImage, threshold) {
	// Invert so originally dark pixels are light
	jimpImage.invert();
	// Replace any light pixels that meet the threshold with white pixels
	jimpImage.threshold({ max: 255 - threshold });
	// Invert the image again, the thresholded pixels are now black
	jimpImage.invert();
	// There will still be gray pixels, replace any gray pixels with white
	jimpImage.threshold({ max: 1, replace: 255 });
	// The image is now pure black and white. We're done, return it!
	return jimpImage;
}
