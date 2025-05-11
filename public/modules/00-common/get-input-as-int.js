/**
 * Given the ID of an input element,
 * Return the value of that input element parsed to an integer
 *
 * @param {string} inputId
 * @returns {number}
 */
export function getInputAsInt(inputId) {
	return parseInt(document.getElementById(inputId).value);
}
