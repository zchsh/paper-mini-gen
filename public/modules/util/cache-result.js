/**
 *
 * @param {string} key
 * @returns
 */
export function getCachedResult(key) {
	const results = window.results || {};
	return results[key];
}

/**
 *
 * @param {string} key
 * @param {unknown} value
 */
export function setCachedResult(key, value) {
	if (!window.results) {
		window.results = {};
	}
	window.results[key] = value;
}
