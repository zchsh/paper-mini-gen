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
	return image
		.gaussianFilter({ radius })
		.grey()
		.mask({ threshold })
		.toDataURL();
}
