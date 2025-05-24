import { Jimp } from "./jimp/index.js";

/**
 * JSDOC type for a loaded Jimp image
 *
 * @typedef {import("./jimp/index.js").Jimp} JimpImage
 */

/**
 * Given a loaded JimpImage, flatten the image onto a white background, and
 * Return the flattened image as a JimpImage.
 *
 * @param {JimpImage} jimpImage - The source of the image to be processed.
 * @param {Object} settings - The settings for flattening the image.
 * @param {Object | number} settings.padding - The padding to apply to the
 * image. If a number is provided, it will be applied to all sides. Otherwise,
 * and object with { top, left, bottom, right } properties should be provided.
 * @param {number} settings.padding.top - The top padding.
 * @param {number} settings.padding.left - The left padding.
 * @param {number} settings.padding.bottom - The bottom padding.
 * @param {number} settings.padding.right - The right padding.
 * @param {number} settings.backgroundColor - The background color to use
 * for the flattened image. Format: 0xRRGGBBAA, default is white (0xffffffff).
 * @returns {Promise<JimpImage>} - A promise that resolves to a JimpImage
 * representing the flattened image.
 */
export async function flattenImage(jimpImage, settings = {}) {
	// Convert the incoming padding value to an object if it's a number
	if (typeof settings.padding === "number") {
		settings.padding = {
			top: settings.padding,
			left: settings.padding,
			bottom: settings.padding,
			right: settings.padding,
		};
	}
	// Merge provided settings with defaults
	const settingsDefault = {
		padding: { top: 0, left: 0, bottom: 0, right: 0 },
		backgroundColor: 0xffffffff,
	};
	const settingsParsed = { ...settingsDefault, ...settings };
	const { padding, backgroundColor } = settingsParsed;
	// Grab the width and height of the loaded image
	const { width, height } = jimpImage.bitmap;
	// Determine the width and height of the new flattened image
	const flatWidth = width + padding.left + padding.right;
	const flatHeight = height + padding.top + padding.bottom;
	// Create a flat background image
	const flatBg = new Jimp({
		width: flatWidth,
		height: flatHeight,
		color: backgroundColor,
	});
	// Composite the loaded image onto the flat background
	const position = { x: padding.left, y: padding.top };
	flatBg.composite(jimpImage, position.x, position.y);
	// Return the flattened image
	return flatBg;
}
