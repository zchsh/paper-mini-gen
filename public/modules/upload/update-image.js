import { setCachedResult } from "../util/cache-result.js";

export function updateImage(
	newImageSrc,
	settings = {},
	callback = async () => null
) {
	const imageBasename = newImageSrc.split("/").pop().split(".")[0];
	if (imageBasename) {
		setCachedResult("imageMeta", { imageBasename });
	}
	// Update settings
	for (const [key, value] of Object.entries(settings)) {
		document.getElementById(key).value = value;
	}
	// Add listener to the image element
	const rawImageElement = document.getElementById("raw-image");
	rawImageElement.src = newImageSrc;
	callback(newImageSrc, imageBasename);
}
