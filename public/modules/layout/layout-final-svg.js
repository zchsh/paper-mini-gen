import { pathDataStringFromRegions } from "../render/path-data-string-from-regions.js";
import { getFallbackViewBox } from "../render/get-fallback-viewbox.js";
import { createSvgElem } from "../render/create-svg-elem.js";

/**
 * Given a set of polygons representing the outline of a cutout shape,
 * an HTMLImageElement containing the original image artwork, and
 * options for the layout, this function assembles and
 * Returns an SVG element that represents the final layout art for
 * printing a paper miniature.
 *
 * @param {{ regions: [number, number][][] }[]} outlinePolygons - The polygons
 * representing the outline of the cutout shape.
 * @param {Object} imgData - The original artwork image data.
 * @param {string} imgData.dataUrl - The data URL of the original image.
 * @param {number} imgData.width - The width of the original image in pixels.
 * @param {number} imgData.height - The height of the original image in pixels.
 * @param {Object} options - Options for the layout
 * @param {number} options.blurPadding - The padding we applied to the original
 * image to prevent blurring artifacts during tracing.
 * @param {number} options.scalePreTrace - The scale factor applied to the
 * original image before tracing.
 * @param {number} options.scalePostTrace - The scale factor applied to the
 * original image after tracing, to match the height set by the user.
 * @param {Object} options.sizeOriginal - The pixel size of the original image,
 * containing `width` and `height` properties.
 * @param {Object} options.baseData - Data about the base size and arrangement.
 * This includes, in pixels, the `size` of each base and the  `overlap` between
 * bases, as well as an array of `centers` for the bases, which are each
 * represented as `[x, y]` coordinates.
 * @returns {Promise<SVGElement>} The SVG element with the final layout art.
 */
export async function layoutFinalSvg(
	outlinePolygons,
	imgData,
	{
		blurPadding,
		scalePreTrace,
		scalePostTrace,
		sizeOriginal,
		baseData,
		outlineColor,
	}
) {
	/**
	 * Grab a UUID for this document. This way,
	 */
	const uuid = crypto.randomUUID();
	/**
	 * Set up the parent SVG container
	 */
	// Add 9 pixels of padding to the viewBox, so borders don't bleed out
	const [minX, minY, svgWidth, svgHeight] = getFallbackViewBox(
		outlinePolygons,
		9
	);
	const svgNode = createSvgElem("svg", {
		xmlns: "http://www.w3.org/2000/svg",
		width: svgWidth,
		height: svgHeight,
		viewBox: `${minX} ${minY} ${svgWidth} ${svgHeight}`,
	});
	/**
	 * Set up a <defs> element, to hold elements we can re-use later.
	 */
	const defsElem = createSvgElem("defs");
	/**
	 * Set up data for shapes for the cut-out outline
	 */
	// Convert the outline polygons to path data strings
	const outlinePathEntries = outlinePolygons.map((polygon, idx) => {
		return {
			id: `outlineData_${idx.toString().padStart(3, "0")}_${uuid}`,
			pathString: pathDataStringFromRegions(polygon.regions),
		};
	});
	/**
	 * Set up a clipping path definition, tracing the outline of the
	 * shape to cut out, to keep images from bleeding outside the shape.
	 *
	 * Note that due to a bug in how Firefox handles SVGs during print,
	 * we'll also be setting up the <path /> definition for the outline
	 * within the `clipPath`. We'll re-use this path definition
	 * for the background and cutting line.
	 *
	 * Bug:
	 * https://bugzilla.mozilla.org/show_bug.cgi?id=1972006
	 */
	const outlineClipPathId = `unionClipPath_${uuid}`;
	const outlineClipPath = createSvgElem("clipPath", { id: outlineClipPathId });
	for (const { id, pathString } of outlinePathEntries) {
		outlineClipPath.append(createSvgElem("path", { id, d: pathString }));
	}
	defsElem.append(outlineClipPath);
	/**
	 * Set up data for the original image.
	 *
	 * Note that the image element sets the scale as well, as width and height
	 * attributes have no effect on <use /> elements in our use case here.
	 *
	 * Reference:
	 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/use
	 */
	const imgScaleFinal = scalePreTrace * scalePostTrace;
	const imageDataElemId = `imageData_${uuid}`;
	const imageDataElem = createSvgElem("image", {
		id: imageDataElemId,
		href: imgData.dataUrl,
		width: imgData.width * imgScaleFinal,
		height: imgData.height * imgScaleFinal,
	});
	defsElem.append(imageDataElem);
	/**
	 * Use the outline shape for a white background,
	 * which will be visible behind the image.
	 */
	const outlineBackground = createSvgElem("g");
	for (const { id } of outlinePathEntries) {
		outlineBackground.append(
			createSvgElem("use", { href: `#${id}`, fill: "white" })
		);
	}
	/**
	 * Use the outline shape for a gray cutting line
	 */
	const outlineCutLine = createSvgElem("g");
	for (const { id } of outlinePathEntries) {
		outlineCutLine.append(
			createSvgElem("use", {
				href: `#${id}`,
				fill: "none",
				stroke: outlineColor,
				"stroke-width": 0.5,
				"stroke-linecap": "round",
				"stroke-linejoin": "round",
				"stroke-miterlimit": 10,
			})
		);
	}
	/**
	 * Position the top image.
	 *
	 * We do some finicky positioning here to ensure the position of
	 * the top image matches the position of the outline shape.
	 */
	const scaledPadding = blurPadding * scalePostTrace;
	const imgTopPosn = { x: scaledPadding, y: scaledPadding };
	const svgImageTop = createSvgElem("use", {
		href: `#${imageDataElemId}`,
		x: imgTopPosn.x,
		y: imgTopPosn.y,
	});
	/**
	 * Position the bottom image, as with the top image.
	 */
	/**
	 * The final image height is the original image height, scaled by the
	 * combined scale factors applied before tracing and during arrangement.
	 */
	const imgHeightFinal = sizeOriginal.height * imgScaleFinal;
	/**
	 * The "float distance" is the distance between the bottom edge
	 * of the top image and the fold line for the top image.
	 */
	const foldLineTopY = baseData.centers[0][1];
	const imgTopLowerY = imgTopPosn.y + imgHeightFinal;
	const imgFloatDistance = foldLineTopY - imgTopLowerY;
	/**
	 * The imgBottomBaseOffset is the distance between the top fold line
	 * and the bottom fold line... which is made up of two full bases
	 * (half the top "base", the middle base, and half the bottom base), minus
	 * the overlap between bases (which occurs twice between the three bases).
	 */
	const imgBottomBaseOffset = 2.0 * baseData.size - 2.0 * baseData.overlap;
	/**
	 * imgTopPosn.y + boundingHeight + imgBottomBaseOffset + arrangeOffsetY
	 *
	 * - imgTopPosn.y would result in the bottom image being positioned in the
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
		imgTopPosn.y + imgHeightFinal + imgFloatDistance * 2 + imgBottomBaseOffset;
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
	/**
	 * Create a group for the bottom image, we apply transforms here
	 * since we can't apply transforms to <use /> elements.
	 */
	const svgImageBottom = createSvgElem("g", {
		transform: `scale(1, -1) translate(0, ${imgBottomReflectionTranslate})`,
	});
	// Add the bottom image with a <use /> element
	svgImageBottom.append(
		createSvgElem("use", {
			href: `#${imageDataElemId}`,
			x: imgTopPosn.x,
			y: imgBottomY,
		})
	);
	/**
	 * Build a group for the "top" and "bottom" images. This group includes
	 * a reference to the outline clip path we created earlier.
	 */
	const imagesClipGroup = createSvgElem("g", {
		"clip-path": `url(#${outlineClipPathId})`,
	});
	/**
	 * Add some dotted lines to the SVG, indicating where to fold the paper
	 */
	// Get the X center of the bases
	const baseCentreX = baseData.centers[0][0];
	const baseRadius = baseData.size / 2;
	// Valley folds
	const valleyFoldStyle = {
		stroke: outlineColor,
		"stroke-width": 0.5,
		"stroke-dasharray": "2 2",
	};
	const valleyFoldTop = createSvgElem("line", {
		x1: baseCentreX - baseRadius,
		y1: baseData.centers[0][1],
		x2: baseCentreX + baseRadius,
		y2: baseData.centers[0][1],
		...valleyFoldStyle,
	});
	const valleyFoldBottom = createSvgElem("line", {
		x1: baseCentreX - baseRadius,
		y1: baseData.centers[2][1],
		x2: baseCentreX + baseRadius,
		y2: baseData.centers[2][1],
		...valleyFoldStyle,
	});
	// Mountain folds
	const mountainFoldStyle = {
		stroke: outlineColor,
		"stroke-width": 0.5,
		"stroke-dasharray": "1 2 4 2",
	};
	// Get the chord length of the circle when positioned at the fold axis
	const distanceToCenter = baseRadius - baseData.overlap / 2.0;
	const halfChordLength = Math.sqrt(
		Math.pow(baseRadius, 2) - Math.pow(distanceToCenter, 2)
	);
	const mountainFoldTop = createSvgElem("line", {
		x1: baseCentreX - halfChordLength,
		y1: baseData.centers[1][1] - distanceToCenter + 0.5,
		x2: baseCentreX + halfChordLength,
		y2: baseData.centers[1][1] - distanceToCenter + 0.5,
		...mountainFoldStyle,
	});
	/**
	 * Alternate fold lines on either side of the shape
	 */
	// const mountainFoldTopLeft = createSvgElem("line", {
	// 	x1: baseCentreX - baseRadius,
	// 	y1: baseData.centers[1][1] - distanceToCenter + 0.5,
	// 	x2: baseCentreX - halfChordLength,
	// 	y2: baseData.centers[1][1] - distanceToCenter + 0.5,
	// 	...mountainFoldStyle,
	// });
	// const mountainFoldTopRight = createSvgElem("line", {
	// 	x1: baseCentreX + halfChordLength,
	// 	y1: baseData.centers[1][1] - distanceToCenter + 0.5,
	// 	x2: baseCentreX + baseRadius,
	// 	y2: baseData.centers[1][1] - distanceToCenter + 0.5,
	// 	...mountainFoldStyle,
	// });
	const mountainFoldBottom = createSvgElem("line", {
		x1: baseCentreX - halfChordLength,
		y1: baseData.centers[1][1] + distanceToCenter - 0.5,
		x2: baseCentreX + halfChordLength,
		y2: baseData.centers[1][1] + distanceToCenter - 0.5,
		...mountainFoldStyle,
	});
	/**
	 * Alternate fold lines on either side of the shape
	 */
	// const mountainFoldBottomLeft = createSvgElem("line", {
	// 	x1: baseCentreX - baseRadius,
	// 	y1: baseData.centers[1][1] + distanceToCenter - 0.5,
	// 	x2: baseCentreX - halfChordLength,
	// 	y2: baseData.centers[1][1] + distanceToCenter - 0.5,
	// 	...mountainFoldStyle,
	// });
	// const mountainFoldBottomRight = createSvgElem("line", {
	// 	x1: baseCentreX + halfChordLength,
	// 	y1: baseData.centers[1][1] + distanceToCenter - 0.5,
	// 	x2: baseCentreX + baseRadius,
	// 	y2: baseData.centers[1][1] + distanceToCenter - 0.5,
	// 	...mountainFoldStyle,
	// });
	/**
	 * Build the final SVG node
	 */
	svgNode.append(defsElem);
	svgNode.append(outlineBackground);
	imagesClipGroup.append(svgImageTop);
	imagesClipGroup.append(svgImageBottom);
	svgNode.append(imagesClipGroup);
	svgNode.append(outlineCutLine);
	svgNode.append(valleyFoldTop);
	svgNode.append(valleyFoldBottom);
	svgNode.append(mountainFoldTop);
	svgNode.append(mountainFoldBottom);
	// svgNode.append(mountainFoldTopLeft);
	// svgNode.append(mountainFoldTopRight);
	// svgNode.append(mountainFoldBottomLeft);
	// svgNode.append(mountainFoldBottomRight);
	// Return the final SVG node
	return svgNode;
}
