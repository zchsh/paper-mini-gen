import { pathDataStringsFromTraceData } from "./imagetracejs-remixes/path-data-strings-from-trace-data.js";

/**
 * TODO: this is a work in progress. finish implementation.
 *
 * TODO: write description and add JSDoc for this function, once done.
 *
 * @param {*} jimpImage
 * @param {*} pathomit
 * @returns
 */
export async function traceImageData(jimpImage, pathomit) {
	return new Promise((resolve, reject) => {
		// Convert the Jimp image to a Uint8ClampedArray
		const imageDataArray = new Uint8ClampedArray(jimpImage.bitmap.data);
		const { width, height } = jimpImage.bitmap;
		// Create a new ImageData object
		const imageDataObj = new ImageData(imageDataArray, width, height);
		// Gather settings for the trace
		const traceSettings = {
			pathomit,
			ltres: 1,
			qtres: 1,
			colorsampling: 0,
			colorquantcycles: 1,
			strokewidth: 0,
			roundcoords: 3,
			/**
			 * Set a custom palette, of:
			 * - black (foreground shapes)
			 * - nearly-white (background shapes, will remove in later step)
			 */
			pal: [
				{ r: 0, g: 0, b: 0, a: 255 },
				{ r: 245, g: 245, b: 245, a: 255 },
			],
		};
		// Trace the image
		const traceData = ImageTracer.imagedataToTracedata(
			imageDataObj,
			traceSettings
		);
		/**
		 * TODO: convert traceData to polygons.
		 * Work in progress...
		 *
		 * TODO: filter out the nearly-white shapes from the trace data.
		 */
		console.log({ traceData });
		const pathDataStrings = pathDataStringsFromTraceData(
			traceData,
			traceSettings
		);

		// Resolve with the traced image data
		resolve({
			pathDataStrings,
			width: traceData.width,
			height: traceData.height,
		});
		/**
		 * TODO: below should be split out to a separate function, I think?
		 * `flattenPathDataStrings` maybe?
		 */
		// TODO: render pathDataStrings into a constructed SVG element
		// const svgElem = TODO... maybe temporarily create an SVG element
		// in the DOM, just to make sure it works? Then later try to do it
		// without the DOM?
		// TODO: flatten the constructed SVG element using `flattenSVG`
		// const paths = flattenSVG(svgElem);
		// TODO: grab the flattened SVG element and return as polygon data?
		// (see existing code in `trace-image.js`, split out separate function,
		// like `polygonsFromFlattenSvgPaths`)
	});
}
