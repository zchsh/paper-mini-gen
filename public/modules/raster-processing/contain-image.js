/**
 * JSDOC type for a loaded Jimp image
 *
 * @typedef {import("./jimp/index.js").Jimp} JimpImage
 */

/**
 * Given a loaded JimpImage, resize it to be contain it in the provided size, and
 * Return a tuple, first the resized image as a JimpImage, then the scale used.
 *
 * @param {JimpImage} jimpImage - The source of the image to be processed.
 * @param {number} size - The size of a square to contain the resized image.
 * @returns {Promise<[JimpImage, number]>} - A promise that resolves to a tuple,
 * the first item is a JimpImage representing the resized image, the second item
 * is the scale used to resize the image.
 */
export async function containImage(jimpImage, size) {
	// Grab the width and height of the loaded image
	const { width, height } = jimpImage.bitmap;
	// Determine the width and height of the new resized image
	const scaleFactor = size / Math.max(width, height);
	// Resize the image to fit within the provided size
	jimpImage.resize({ w: scaleFactor * width, h: scaleFactor * height });
	// Return the resized image, and the scale used to resize it
	return [jimpImage, scaleFactor];
}
