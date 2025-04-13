/**
 * Given an image source, a threshold value, and a blur radius value,
 * Return a processed image source.
 *
 * @param {string} imgSrc
 * @param {number} threshold
 * @param {number} radius
 * @returns {string}
 */
async function applyThreshold(imgSrc, threshold, radius) {
	let image = await IJS.Image.load(imgSrc);
	return (
		image
			// Pad the image, to avoid blur issues near image boundaries
			.pad({ size: radius * 2, algorithm: "set", color: [255, 255, 255, 255] })
			// Apply the blur
			.gaussianFilter({ radius })
			// Convert to grayscale
			.grey()
			// Convert to black-and-white using a threshold mask
			.mask({ threshold })
			// Cast to a data URL that can be used as an <img> src
			.toDataURL()
	);
}
