// COMMON
import { pathDataStringFromRegions } from "../render/path-data-string-from-regions.js";
import { getFallbackViewBox } from "../render/get-fallback-viewbox.js";
import { createSvgElem } from "../render/create-svg-elem.js";

/**
 * TODO: clean this up, haven't touched it since prototyping
 *
 * THINKING THROUGH POSITIONING...
 *
 * - image is scaled to fit 400 x 400
 * - image is padded with (radius * 4) pixels on all sides
 * - image is traced
 * - image is offset, viewBox is altered to account for offset
 * - ... arrangement, should affect position of top image
 *
 * Need to position the top image so that it's in the same place as the traced
 * outline.
 */
export async function applyLayout(
	polygons,
	{ blurPadding, scalePreTrace, scalePostTrace, sizeOriginal, baseData },
	renderId
) {
	const OUTLINE_COLOR = "#DDDDDD";

	const viewBox = getFallbackViewBox(polygons, 9);
	const pathStrings = polygons.map((polygon) => {
		return pathDataStringFromRegions(polygon.regions);
	});

	// Set up the SVG node
	// const [minX, minY, svgWidth, svgHeight] = viewBox;
	const DEV_PADDING = 0;
	const [minX, minY, svgWidth, svgHeight] = [
		viewBox[0] - DEV_PADDING,
		viewBox[1] - DEV_PADDING,
		viewBox[2] + DEV_PADDING * 2,
		viewBox[3] + DEV_PADDING * 2,
	];
	const svgNode = createSvgElem("svg", {
		width: svgWidth,
		height: svgHeight,
		viewBox: `${minX} ${minY} ${svgWidth} ${svgHeight}`,
	});

	// Set up path nodes, representing the traced, offset, & union'd shapes
	const pathsUnionBackground = pathStrings.map((pathString) => {
		return createSvgElem("path", {
			"fill-rule": "nonzero",
			fill: "white",
			d: pathString,
		});
	});
	const pathsUnionOutline = pathStrings.map((pathString) => {
		return createSvgElem("path", {
			"fill-rule": "nonzero",
			fill: "none",
			stroke: OUTLINE_COLOR,
			"stroke-width": 0.5,
			"stroke-linecap": "round",
			"stroke-linejoin": "round",
			"stroke-miterlimit": 10,
			d: pathString,
		});
	});

	// Set up a clip-path, using the union'd shape
	const clipPathUnion = createSvgElem("clipPath", {
		id: "unionclip",
	});
	clipPathUnion.append(
		...pathStrings.map((pathString) => {
			return createSvgElem("path", {
				"fill-rule": "nonzero",
				fill: "white",
				d: pathString,
			});
		})
	);
	/**
	 * Grab the image element, embed into the SVG,
	 * positioning the top image carefully to match the union'd shape.
	 */
	const imgScaleFinal = scalePreTrace * scalePostTrace;
	const scaledPadding = blurPadding * scalePostTrace;
	const imgTopX = scaledPadding;
	const imgTopY = scaledPadding;
	const imageElem = document.getElementById("raw-image");
	const svgImageTop = await getImageNode(imageElem, imgScaleFinal, {
		x: imgTopX,
		y: imgTopY,
		style: "opacity: 1;",
	});

	/**
	 * Position the bottom image, as with the top image.
	 */
	/**
	 * The final image height is the original image height, scaled
	 * by the scale factors applied before tracing and during arrangement.
	 */
	const imgHeightFinal = sizeOriginal.height * imgScaleFinal;
	/**
	 * The "float distance" is the distance between the bottom edge
	 * of the top image and the fold line for the top image.
	 */
	const foldLineTopY = baseData.centers[0][1];
	const imgTopLowerY = imgTopY + imgHeightFinal;
	const imgFloatDistance = foldLineTopY - imgTopLowerY;
	/**
	 * The imgBottomBaseOffset is the distance between the top fold line
	 * and the bottom fold line... which is made up of two full bases
	 * (half the top "base", the middle base, and half the bottom base), minus
	 * the overlap between bases (which occurs twice between the three bases).
	 */
	const imgBottomBaseOffset = 2.0 * baseData.size - 2.0 * baseData.overlap;
	/**
	 * imgTopY + boundingHeight + imgBottomBaseOffset + arrangeOffsetY
	 *
	 * - imgTopY would result in the bottom image being positioned in the
	 *   same place as the top image.
	 * - + imgHeightFinal aligns the top of the bottom image with the
	 * 	 bottom of the top image. At this point, the bottom image should be
	 *   directly next to the top image.
	 * - + imgFloatDistance * 2 moves the bottom image so that the distance
	 *   from the top of the bottom image to the top fold matches the distance
	 *   from the bottom of the top image to the top fold. After this,
	 *   the bottom image should appear reflected about the top fold line.
	 * - imgBottomBaseOffset moves the bottom image down so that it's as close
	 *   to the bottom fold as it was to the top fold.
	 */
	const imgBottomY =
		imgTopY + imgHeightFinal + imgFloatDistance * 2 + imgBottomBaseOffset;

	/**
	 * When we reflect the image, it's reflected about the origin point (0,0).
	 * This means the image is flipped up way outside the viewbox. To compensate,
	 * we need to translate the image back down.
	 *
	 * Note: ideally, we'd instead use the SVG `transform-origin` property.
	 * But transform-origin doesn't seem to have wide support yet.
	 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/transform-origin
	 */
	const imgBottomReflectionTranslate = -1 * (imgBottomY * 2 + imgHeightFinal);
	const svgImageBottom = await getImageNode(imageElem, imgScaleFinal, {
		transform: `scale(1, -1) translate(0, ${imgBottomReflectionTranslate})`,
		x: imgTopX,
		y: imgBottomY,
	});

	/**
	 * Build a group for the two images, which includes a clip-path
	 */
	const svgGroupImages = createSvgElem("g", {
		"clip-path": "url(#unionclip)",
	});

	/**
	 * Add some dotted lines to the SVG
	 */
	const dottedLineTop = createSvgElem("line", {
		x1: baseData.centers[0][0] - baseData.size / 2,
		y1: baseData.centers[0][1],
		x2: baseData.centers[0][0] + baseData.size / 2,
		y2: baseData.centers[0][1],
		stroke: OUTLINE_COLOR,
		"stroke-width": 0.5,
		"stroke-dasharray": "2, 2",
	});
	const dottedLineBottom = createSvgElem("line", {
		x1: baseData.centers[2][0] - baseData.size / 2,
		y1: baseData.centers[2][1],
		x2: baseData.centers[2][0] + baseData.size / 2,
		y2: baseData.centers[2][1],
		stroke: OUTLINE_COLOR,
		"stroke-width": 0.5,
		"stroke-dasharray": "2, 2",
	});
	/**
	 * Build and render the SVG
	 */
	svgNode.appendChild(clipPathUnion);
	svgNode.append(...pathsUnionBackground);
	svgGroupImages.appendChild(svgImageTop);
	svgGroupImages.appendChild(svgImageBottom);
	svgNode.appendChild(svgGroupImages);
	svgNode.append(...pathsUnionOutline);
	// svgNode.append(...pathsDebugUnion);
	svgNode.appendChild(dottedLineTop);
	svgNode.appendChild(dottedLineBottom);

	const renderElem = document.getElementById(renderId);
	renderElem.innerHTML = "";
	renderElem.appendChild(svgNode);
}

function toDataUrl(url) {
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

async function getImageNode(
	imageElem,
	scale,
	moreAttributes = {},
	debugFill = null,
	debugStroke = null
) {
	const imgSrc = imageElem.getAttribute("src");
	const imgDataUrl = await toDataUrl(imgSrc);
	const imgHeight = imageElem.naturalHeight;
	const imgWidth = imageElem.naturalWidth;
	const imgNode = createSvgElem("image", {
		width: imgWidth * scale,
		height: imgHeight * scale,
		"xlink:href": imgDataUrl,
		...moreAttributes,
	});
	//
	if (debugFill === null && debugStroke === null) {
		return imgNode;
	}
	//
	const groupNode = createSvgElem("g");
	const devOutlineNode = createSvgElem("rect", {
		x: moreAttributes.x,
		y: moreAttributes.y,
		width: imgWidth * scale,
		height: imgHeight * scale,
		fill: debugFill,
		stroke: debugStroke,
		"stroke-width": 0.5,
	});
	groupNode.appendChild(imgNode);
	groupNode.appendChild(devOutlineNode);
	return groupNode;
}
