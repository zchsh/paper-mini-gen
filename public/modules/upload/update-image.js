export function updateImage(
	newImageSrc,
	settings = {},
	callback = async () => null
) {
	const rawImageElement = document.getElementById("raw-image");
	rawImageElement.src = newImageSrc;
	rawImageElement.onload = async () => {
		// Update settings
		// console.log({ settings });
		for (const [key, value] of Object.entries(settings)) {
			document.getElementById(key).value = value;
		}
		await callback();
	};
}
