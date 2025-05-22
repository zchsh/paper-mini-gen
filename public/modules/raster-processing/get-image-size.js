/**
 * JSDOC type for a loaded Jimp image
 *
 * @typedef {import("./jimp/index.js").Jimp} JimpImage
 */

/**
 * Given a loaded JimpImage,
 * Return the width and height of the image.
 *
 * @param {JimpImage} jimpImage - The image source.
 * @returns {Promise<{ width: number, height: number}>} - A promise that
 * resolves to an object with the width and height of the flattened image.
 */
export function getImageSize(jimpImage) {
	const { width, height } = jimpImage.bitmap;
	return { width, height };
}
