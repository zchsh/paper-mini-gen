export function getFallbackThreshold(loadedImage) {
	const cornerPixels = getCornerPixels(loadedImage);
	const THRESHOLD_BUFFER = 15;
	return getApproxBackgroundLuminosity(cornerPixels) - THRESHOLD_BUFFER;
}

function getCornerPixels(image) {
	const width = image.width;
	const height = image.height;
	const lastX = width - 1;
	const lastY = height - 1;
	const cornerPixelsCoords = [
		[0, 0],
		[lastX, 0],
		[0, lastY],
		[lastX, lastY],
	];
	const cornerPixels = cornerPixelsCoords.map(([x, y]) => {
		return image.getPixelXY(x, y);
	});
	return cornerPixels;
}

function getApproxBackgroundLuminosity(cornerPixels) {
	const cornerLuminosities = [...cornerPixels]
		.map((p) => getLuminosity(p))
		.filter((l) => typeof l === "number" && !isNaN(l))
		.sort();
	const cornerLuminositiesTwoLargest = cornerLuminosities.slice(0, 2);
	const cornerLuminositiesAverage =
		cornerLuminositiesTwoLargest.reduce((acc, entry) => {
			return acc + entry;
		}, 0) / cornerLuminositiesTwoLargest.length;
	return cornerLuminositiesAverage;
}

/**
 * NOTE: we don't handle luminosity for transparent images.
 *
 * @param {*} rgbaValues
 * @returns
 */
function getLuminosity(rgbaValues) {
	const [R, G, B, A] = rgbaValues;
	const rgbLuminosity = 0.2126 * R + 0.7152 * G + 0.0722 * B;
	return rgbLuminosity / 2.55;
}
