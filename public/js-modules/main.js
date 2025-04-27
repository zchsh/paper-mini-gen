// COMMON
import { getInputAsInt } from "/js-modules/modules/00-common/get-input-as-int.js";
// UPLOAD
import { onImageSelection } from "/js-modules/modules/01-upload/on-image-selection.js";
// SILHOUETTE
import { processImage } from "/js-modules/modules/02-silhouette/process-image.js";
// ARRANGE
import {
	visitPoints,
	visitPointsPolygon,
} from "/js-modules/modules/05-arrange/visit-points.js";

/**
 * UPLOAD
 */
window.onImageSelection = onImageSelection;

/**
 * SILHOUETTE
 */
function silhouetteResetSettings() {
	document.getElementById("threshold").value = 100;
	document.getElementById("radius").value = 6;
}
window.silhouetteResetSettings = silhouetteResetSettings;

async function silhouetteExecute(imgSrcId, imgDestId, resizeMax) {
	// Gather settings
	const threshold = getInputAsInt("threshold");
	const radius = getInputAsInt("radius");
	// Gather elements
	const inputElem = document.getElementById(imgSrcId);
	const outputElem = document.getElementById(imgDestId);
	// Execute
	/**
	 * TODO: should maybe pad the silhouette image extra?
	 * That way, we'd account for `offset` in one go.
	 * Might make later calculations related to placing the original
	 * image correctly a little easier.
	 */
	const [processedSrc, width, height] = await processImage(
		inputElem.src,
		radius,
		threshold,
		resizeMax
	);
	outputElem.src = processedSrc;
	const paddingBeforeTrace = radius * 2;
	return [paddingBeforeTrace, width, height];
}
window.silhouetteExecute = silhouetteExecute;

/**
 * TRACE
 *
 * TODO: improve curve flattening.
 * Have `demo-flatten-svg` for this.
 * Note that flattenSvg takes in an SVG element.
 * So, probably fine to keep existing workflow of writing to SVG element.
 *
 * If you ever get concerned about visible thrash, you could
 * run the whole process in a hidden SVG element, I think... falttenSvg
 * seems to walk the DOM, doesn't seem to rely on the element being
 * visibly rendered.
 */
async function traceExecute(imgElemId, svgContainerId) {
	return new Promise((resolve, reject) => {
		/**
		 * NOTE: uses https://github.com/jankovicsandras/imagetracerjs
		 */
		const pathomit = getInputAsInt("pathomit");
		// Adding custom palette. This will override numberofcolors.
		// Loading an image, tracing with the 'posterized2' option preset, and appending the SVG to an element with id=svgContainerId
		const imageSource = document.getElementById(imgElemId).getAttribute("src");
		/**
		 * Set up function to run after tracing is complete
		 * TODO: this could be an argument to traceExecute()?
		 *
		 * @param {*} svgString
		 */
		function doneTracingCallback(svgString) {
			const svgContainerElem = document.getElementById(svgContainerId);
			/**
			 * TODO: does `ImageTracer` really need to be used here?
			 * Could you just do:
			 * svgContainerElem.innerHTML = svgString;
			 */
			svgContainerElem.innerHTML = "";
			ImageTracer.appendSVGString(svgString, svgContainerId);
			// Clean up SVG
			cleanupTrace(svgContainerElem);
			//
			resolve(svgString);
		}
		/**
		 * TODO: is there a way to trace with straight lines only?
		 * Could simplify the process dramatically...
		 */
		ImageTracer.imageToSVG(
			imageSource /* input filename / URL */,
			doneTracingCallback,
			{
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
			}
		);
	});
}
window.traceExecute = traceExecute;

/**
 * TRACE - CLEANUP, CONVERT TO POLYGON
 *
 * TODO: ensure you're using the polygon conversion method that you like!
 * I THINK I might still be using the old method... new method has
 * curve flattening, which I think really helps!
 */
function cleanupTrace(svgContainerElem) {
	/**
	 * Retain only the "foreground" paths.
	 *
	 * We only want to outline and boolean add the traced paths
	 * that are "foreground" (ie black). Speficially, remove paths with
	 * `fill="rgb(245,245,245)"`. Note this specific colour was set
	 * in the palette of the trace in an earlier step.
	 */
	svgContainerElem
		.querySelectorAll(`path[fill="rgb(245,245,245)"]`)
		.forEach((e) => e.remove());
	/**
	 * Convert the foreground paths, which may include curves,
	 * to polygons, which will consist of straigh lines only.
	 */
	// Flatten the SVG into an array of paths
	const svgElem = svgContainerElem.querySelector("svg");
	const paths = flattenSVG(svgElem);
	/**
	 * Iterate over the returned paths,
	 * to produce an array of polygons.
	 * Each polygon may have many regions (eg shapes with cutouts).
	 *
	 * Regions may mean filled or un-filled areas, something to do with
	 * winding order, I don't fully get it but so far it works...
	 */
	const polygons = [];
	let regions = [];
	let currentGroupId = null;
	for (const path of paths) {
		/**
		 * TODO: is groupId still needed here?
		 * Have not implemented any kind of group assignment...
		 * But somehow things still seem to work?
		 */
		const { groupId, points } = path;
		const isFirstIteration = currentGroupId === null;
		const hasGroupId = typeof groupId === "string";
		const hasGroupIdMatch = hasGroupId && groupId === currentGroupId;
		if (isFirstIteration || hasGroupIdMatch) {
			regions.push(points);
		} else {
			// Push the existing regions to a polygon
			polygons.push({ regions });
			// Reset regions, we're starting a new polygon
			regions = [];
			// Push the points from this path as a region in the new polygon
			regions.push(points);
		}
		// Update the groupId
		currentGroupId = groupId;
	}
	// Push the in-progress region (not yet pushed, cause there was no
	// different groupID to follow it and cause it to be pushed)
	polygons.push({ regions });

	/**
	 * TODO: the `polygons` variable has the polygon data
	 * that might be appropriate to pass to the next step!
	 */

	const viewBox = parseSvgViewbox(svgElem);
	const svgStringAll = renderPolygonsAsPathSvg(polygons, viewBox);
	//
	svgContainerElem.innerHTML = svgStringAll;
}

/**
 * OFFSET
 *
 * TODO: not shown here cause I couldn't figure out imports and stuff.
 * Might be worth figuring that out so you can clean things up a bit.
 */

/**
 * ARRANGEMENT
 *
 * TODO: finish and clean up below
 */
function arrangeForUnion(rawPolygons, targetContainer) {
	// Determine the scale factor to meet the target height in mm
	const PIXELS_PER_INCH = 72;
	const MM_PER_INCH = 25.4;
	const rawPoints = rawPolygons.map((p) => p.regions.flat()).flat();
	const rawBoundingBox = getBoundingPoints(rawPoints);
	const rawHeight = rawBoundingBox.maxY - rawBoundingBox.minY;
	const rawHeightMm = (rawHeight / PIXELS_PER_INCH) * MM_PER_INCH;
	const heightInputMm = getInputAsInt("heightMm");
	// Scale the polygons about the 0,0 origin
	const scale = heightInputMm / rawHeightMm;
	const polygons = visitPoints(rawPolygons, ([x, y]) => {
		return [x * scale, y * scale];
	});

	const allPoints = polygons.map((p) => p.regions.flat()).flat();
	const { minX, minY, maxX, maxY } = getBoundingPoints(allPoints);

	const boundingHeight = maxY - minY;
	const boundingWidth = maxX - minX;
	const boundingCenterX = (minX + maxX) / 2;

	const originalBottom = minY + boundingHeight;

	// Add some circular polygons for the base and stuff
	const baseSizeMm = getInputAsInt("baseSizeMm");
	const baseSize = baseSizeMm * (PIXELS_PER_INCH / MM_PER_INCH);
	const baseOverlap = Math.ceil(baseSize / 10);

	const rawBaseCenters = [
		[boundingCenterX, originalBottom],
		[boundingCenterX, originalBottom + baseSize - baseOverlap],
		[boundingCenterX, originalBottom + (baseSize - baseOverlap) * 2],
	];

	// Add X and Y offset. Note that we move the "base" pieces,
	// and leave the original piece in place.
	/**
	 * TODO: neat idea... what if you found the "center of mass"
	 * of the incoming polygon, and used that as a "base" offset?
	 * The input offset would be applied on top of that "base" offset.
	 * As-is, polygons are centered based on bounding boxes... which is
	 * a little bit different!
	 */
	const arrangeOffsetX = getInputAsInt("arrangeOffsetX");
	const arrangeOffsetY = getInputAsInt("arrangeOffsetY");

	const baseCenters = rawBaseCenters.map(([x, y]) => {
		return [x - arrangeOffsetX, y + arrangeOffsetY];
	});

	const circleBase = {
		regions: [createCircularPolygon(baseSize / 2, 24, baseCenters[0])],
	};
	const circleBaseTop = {
		regions: [createCircularPolygon(baseSize / 2, 24, baseCenters[1])],
	};
	const circleBaseBottom = {
		regions: [createCircularPolygon(baseSize / 2, 24, baseCenters[2])],
	};

	// Add a reflected duplicate for the "other side"
	const rawReflection = visitPoints(polygons, ([x, y]) => {
		return [x, y * -1];
	});
	const polygonsReflected = visitPoints(rawReflection, ([x, y]) => {
		const offset = originalBottom * 2 + (baseSize - baseOverlap) * 2;
		return [x, y + offset];
	});

	const arrangedPolygons = [
		...polygons,
		...translatePolygons(polygonsReflected, [0, arrangeOffsetY * 2]),
		circleBaseTop,
		circleBase,
		circleBaseBottom,
	];

	const viewBoxPadding = 9; // 1/8 inch
	const svgStringArranged = renderPolygonsAsPathSvg(
		arrangedPolygons,
		viewBoxPadding
	);
	targetContainer.innerHTML = svgStringArranged;

	return {
		polygons_arranged: arrangedPolygons,
		scale,
		baseSize,
		baseOverlap,
		boundingWidth,
		boundingHeight,
		boundingBox: { minX, minY, maxX, maxY },
		arrangeOffset: [arrangeOffsetX, arrangeOffsetY],
		baseCenters,
	};
}

function translatePolygons(polygons, offset) {
	return polygons.map((polygon) => {
		return translatePolygon(polygon, offset);
	});
}

function translatePolygon(polygon, offset) {
	return visitPointsPolygon(polygon, ([x, y]) => {
		return [x + offset[0], y + offset[1]];
	});
}

window.arrangeForUnion = arrangeForUnion;

/**
 * UNION
 *
 * TODO: finish and clean up below
 */
function applyUnion(polygonObjs, renderId, debugId01, debugId02) {
	// Debug individual shapes
	if (debugId01) {
		const container = document.getElementById(debugId01);
		container.innerHTML = "";
		for (const polygonObj of polygonObjs) {
			const svgString = renderPolygonsAsPathSvg([polygonObj], 9);
			container.innerHTML += svgString;
		}
	}

	// Debug arrangement of individual shapes
	if (debugId02) {
		const container = document.getElementById(debugId02);
		const svgString = renderPolygonsAsPathSvg(polygonObjs, 9);
		container.innerHTML = svgString;
	}

	/**
	 * Union of many shapes, as pulled from examples:
	 * https://github.com/velipso/polybooljs?tab=readme-ov-file#advanced-example-1
	 */
	const unionPolygonObj = unionPolygonObjects(polygonObjs);
	const unionSvg = renderPolygonsAsPathSvg([unionPolygonObj], 9);
	document.getElementById(renderId).innerHTML = unionSvg;
	return unionPolygonObj;
}

function unionPolygonObjects(polygons) {
	var segments = PolyBool.segments(polygons[0]);
	for (var i = 1; i < polygons.length; i++) {
		var seg2 = PolyBool.segments(polygons[i]);
		var comb = PolyBool.combine(segments, seg2);
		segments = PolyBool.selectUnion(comb);
	}
	return PolyBool.polygon(segments);
}

window.applyUnion = applyUnion;

/**
 * TODO: implement layout
 *
 * - [ ] refactor to prepare to compose a single SVG from many shapes
         (currently, we get an SVG string... but we want to put
				 multiple elements in the same SVG...)
 * - [ ] update SVG styling of polygon object
 * - [ ] add original image, in any location
 * - [ ] adjust image location (may need more args)
 * - [ ] add dotted lines
 */
async function applyLayout(
	polygonObj,
	{
		paddingBeforeTrace,
		scale,
		arrangeOffset,
		imgResizeMax,
		imgWidth,
		imgHeight,
		boundingWidth,
		boundingHeight,
		boundingBox,
		baseSize,
		baseOverlap,
		baseCenters,
	},
	renderId
) {
	const OUTLINE_COLOR = "#DDDDDD";

	const viewBox = getFallbackViewBox([polygonObj], 9);
	const pathStrings = [polygonObj].map((polygon) => {
		return renderPolygonAsPathString(polygon);
	});

	// Set up the SVG node
	const [minX, minY, svgWidth, svgHeight] = viewBox;
	const svgNode = buildSvgNode("svg", {
		width: svgWidth,
		height: svgHeight,
		viewBox: `${minX} ${minY} ${svgWidth} ${svgHeight}`,
	});

	// Set up path nodes, representing the traced, offset, & union'd shapes
	const pathsUnionBackground = pathStrings.map((pathString) => {
		return buildSvgNode("path", {
			"fill-rule": "nonzero",
			fill: "white",
			d: pathString,
		});
	});
	const pathsUnionOutline = pathStrings.map((pathString) => {
		return buildSvgNode("path", {
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
	const clipPathUnion = buildSvgNode("clipPath", {
		id: "unionclip",
	});
	clipPathUnion.append(
		...pathStrings.map((pathString) => {
			return buildSvgNode("path", {
				"fill-rule": "nonzero",
				fill: "white",
				d: pathString,
			});
		})
	);
	/**
	 * Grab the image element, embed into the SVG,
	 * positioning it carefully to match the union'd shape.
	 */
	const scalePostTrace = scale;
	const maxImgDimension = Math.max(imgWidth, imgHeight);
	const scalePreTrace = imgResizeMax / maxImgDimension;
	const finalImgScale = scalePreTrace * scalePostTrace;
	const imageElem = document.getElementById("raw-image");
	const scaledPadding = paddingBeforeTrace * scalePostTrace;
	const imgTopX = scaledPadding;
	const imgTopY = scaledPadding;
	const svgImageTop = await getImageNode(imageElem, finalImgScale, {
		x: imgTopX,
		y: imgTopY,
		style: "opacity: 1;",
		// "clip-path": "url(#unionclip)",
	});
	const imgBottomX = scaledPadding;
	const polygonHeightOffset = -1.0 * boundingHeight;
	const imgBottomReflectOffset = -1.0 * (imgHeight * finalImgScale);
	const imgBottomBaseOffset = 2.0 * (baseSize - baseOverlap);
	const [arrangeOffsetX, arrangeOffsetY] = arrangeOffset;

	// Transforms happen AFTER the clipping mask is applied...
	// The clipping mask is applied to the image at the "top" position...
	// and then the image is SCALED (inverted), then TRANSLATED to the "bottom"
	// position.

	// const imgBottomTranslateY =
	// 	polygonHeightOffset +
	// 	imgBottomBaseOffset * -1 +
	// 	imgBottomReflectOffset -
	// 	// arrangeOffsetY * 2 -
	// 	// scaledPadding -
	// 	// 4.66; // TODO: why the heck is this needed? rounding? meh, ignoring... for now
	// 	7.36;
	console.log({
		imgTopY,
		scaledPadding,
		arrangeOffsetY,
	});
	const imgBottomY =
		imgTopY + boundingHeight + imgBottomBaseOffset + arrangeOffsetY * 2;
	// const imgWidthFinal = imgWidth * finalImgScale;
	const imgHeightFinal = imgHeight * finalImgScale;
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
	const svgImageBottom = await getImageNode(imageElem, finalImgScale, {
		transform: `scale(1, -1) translate(0, ${imgBottomReflectionTranslate})`,
		x: imgBottomX,
		y: imgBottomY,
		style: "opacity: 1;",
	});

	/**
	 * Build a group for the two images, which includes a clip-path
	 */
	const svgGroupImages = buildSvgNode("g", {
		"clip-path": "url(#unionclip)",
	});

	/**
	 * Add some dotted lines to the SVG
	 */
	const dottedLineTop = buildSvgNode("line", {
		x1: baseCenters[0][0] - baseSize / 2,
		y1: baseCenters[0][1],
		x2: baseCenters[0][0] + baseSize / 2,
		y2: baseCenters[0][1],
		stroke: OUTLINE_COLOR,
		"stroke-width": 0.5,
		"stroke-dasharray": "2, 2",
	});
	const dottedLineBottom = buildSvgNode("line", {
		x1: baseCenters[2][0] - baseSize / 2,
		y1: baseCenters[2][1],
		x2: baseCenters[2][0] + baseSize / 2,
		y2: baseCenters[2][1],
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

function buildSvgNode(nodeType, values) {
	const node = document.createElementNS("http://www.w3.org/2000/svg", nodeType);
	for (const key in values) {
		const namespace =
			key === "xlink:href" ? "http://www.w3.org/1999/xlink" : null;
		if (namespace !== null) {
			node.setAttributeNS(namespace, key, values[key]);
		} else {
			node.setAttribute(key, values[key]);
		}
	}
	return node;
}

async function getImageNode(imageElem, scale, moreAttributes = {}) {
	const imgSrc = imageElem.getAttribute("src");
	const imgDataUrl = await toDataUrl(imgSrc);
	const imgHeight = imageElem.naturalHeight;
	const imgWidth = imageElem.naturalWidth;
	const imgNode = buildSvgNode("image", {
		width: imgWidth * scale,
		height: imgHeight * scale,
		"xlink:href": imgDataUrl,
		...moreAttributes,
	});
	return imgNode;
	// svgElem.insertBefore(imgNode, svgElem.firstChild);
}

window.applyLayout = applyLayout;
