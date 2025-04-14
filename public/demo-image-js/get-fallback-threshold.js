async function getFallbackThreshold(imgSrc) {
	let image = await IJS.Image.load(imgSrc);
	const cornerPixels = getCornerPixels(image);
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

function getLuminosity(rgbaValues) {
	const [R, G, B, A] = rgbaValues;
	const rgbLuminosity = 0.2126 * R + 0.7152 * G + 0.0722 * B;
	// If we have full transparency, we should treat that as pure white
	const transparentLuminosity = 255 - A;
	return Math.max(rgbLuminosity, transparentLuminosity) / 2.55;
}
