/**
 * Converts a URL to a Data URL.
 *
 * @param {string} url - The URL to convert to a Data URL.
 * @returns {Promise<string>} A promise that resolves to the Data URL.
 */
export function toDataUrl(url) {
	return new Promise((resolve, reject) => {
		fetch(url)
			.then((response) => response.blob())
			.then((blob) => {
				const reader = new FileReader();
				reader.onloadend = () => resolve(reader.result);
				reader.onerror = reject;
				reader.readAsDataURL(blob);
			});
	});
}
