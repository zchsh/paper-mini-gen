/**
 * Given the ID of an input element,
 * Return the value of that input element parsed to an integer.
 *
 * Note that this function may return NaN if the input element does not
 * exist, or if the value of the input element cannot be parsed.
 *
 * @param {string} inputId
 * @returns {number}
 */
export function getInputAsInt(inputId) {
	return parseInt(document.getElementById(inputId).value);
}
