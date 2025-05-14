async function processImage(imgSrc, radius, threshold) {
	// Gather optional settings
	const useAuto = threshold === 100;
	/**
	 * TODO (later): for transparent images,
	 * somehow apply a white background before processing?
	 * This should happen before auto-threshold, and before
	 * applyThreshold as well.
	 *
	 * Until then, only support `.jpg`, not `.png`?
	 *
	 * Maybe helpful link:
	 * https://github.com/image-js/image-js/issues/485#issuecomment-508472868
	 */
	let image = await IJS.Image.load(imgSrc);

	/**
	 * TODO: below is roughed in from:
	 * https://github.com/image-js/image-js/issues/485#issuecomment-508472868
	 *
	 * THIS DOES DO *SOMETHING*. If I comment it out, I get an all-white image,
	 * with no silhouette at all.... If I leave it in, I get a silhouette, but
	 * it's like the entire image aka a black square which isn't what I want.
	 * Maybe there'd be a way to show an intermediate step with the
	 * PNG conversion to JPEG shown?
	 */
	let withAlphaMaskSrc = null;
	// Get the alpha channel.
	const hasAlphaChannel = image.alpha;
	const colorModel = image.colorModel;
	const extension = image.extension;
	console.log({ extension, hasAlphaChannel, colorModel });
	if (hasAlphaChannel) {
		// Convert to JPEG
		withAlphaMaskSrc = image.toDataURL();
		// Convert to RGB
		// image = image.toRGB();
	}
	// const alphaChannel = image.getChannel(3);
	// console.log({ alphaChannel });
	// // Create a binary mask on the transparent pixels (255 = opaque).
	// const mask = alphaChannel.mask({ threshold: 255, invert: true });
	// // Paint the pixels from the mask in white.
	// image.paintMasks(mask, { color: "magenta" });
	// // Convert to JPEG
	// const withAlphaMaskSrc = image.toDataURL();

	const thresholdAuto = await getFallbackThreshold(image);
	const finalThreshold = useAuto ? thresholdAuto : threshold;
	// Process the image
	const processedSrc = await applyThreshold(
		image,
		finalThreshold / 100.0,
		radius
	);
	// Load the image into a destination element
	return [processedSrc, withAlphaMaskSrc];
}
