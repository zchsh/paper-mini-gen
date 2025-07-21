/**
 * Given a luminosity value, 0-100,
 * Return a hex color code representing that luminosity as a grayscale color.
 *
 * @param {number} luminosity
 * @returns {string}
 */
export function hexColorFromLuminosity(luminosity) {
	const hexValue = Math.round((luminosity / 100) * 255).toString(16);
	const hexPadded = hexValue.padStart(2, "0");
	const hexCode = `#${hexPadded}${hexPadded}${hexPadded}`;
	return hexCode;
}
