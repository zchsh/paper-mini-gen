export function updateImage(
	newImageSrc,
	settings = {},
	callback = async () => null
) {
	// Update settings
	for (const [key, value] of Object.entries(settings)) {
		document.getElementById(key).value = value;
	}
	// Add listener to the image element
	const rawImageElement = document.getElementById("raw-image");
	rawImageElement.src = newImageSrc;
	rawImageElement.onload = async () => {
		await callback();
	};
}
