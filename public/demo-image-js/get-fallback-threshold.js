function getLuminosity(rgbaValues) {
	const [R, G, B, A] = rgbaValues;
	const rgbLuminosity = 0.2126 * R + 0.7152 * G + 0.0722 * B;
	return (rgbLuminosity * (A / 255.0)) / 2.55;
}

async function getFallbackThreshold(imgSrc) {
	let image = await IJS.Image.load(imgSrc);
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
	const cornerLuminosities = cornerPixels.map((p) => getLuminosity(p));
	/**
	 * TODO:
	 * - filter out any invalid corner luminosities (must be number, not NaN)
	 * - get average of valid corner luminosities
	 * - subtract... 15 maybe? (100 → 85)
	 * - return as the fallback
	 */
	console.log({ cornerPixels, cornerLuminosities });
	return 80;
	// return (
	// 	image
	// 		// Pad the image, to avoid blur issues near image boundaries
	// 		.pad({ size: radius * 2, algorithm: "set", color: [255, 255, 255, 255] })
	// 		// Apply the blur
	// 		.gaussianFilter({ radius })
	// 		// Convert to grayscale
	// 		.grey()
	// 		// Convert to black-and-white using a threshold mask
	// 		.mask({ threshold })
	// 		// Cast to a data URL that can be used as an <img> src
	// 		.toDataURL()
	// );
}
