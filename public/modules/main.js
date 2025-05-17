// COMMON
import { getInputAsInt } from "/modules/00-common/get-input-as-int.js";
import { getFallbackViewBox } from "/modules/00-common/get-fallback-viewbox.js";
import { getBoundingPoints } from "/modules/00-common/get-bounding-points.js";
import { pathDataStringFromRegions } from "/modules/00-common/path-data-string-from-regions.js";
// UPLOAD
import { onImageSelection } from "/modules/01-upload/on-image-selection.js";
import { resetSettings } from "/modules/01-upload/reset-settings.js";
// SILHOUETTE
import { processImage } from "/modules/02-silhouette/process-image.js";
// import { Jimp } from "/modules/raster-processing/jimp/jimp-globalizer.js";
import { createSilhouette } from "/modules/raster-processing/create-silhouette.js";
// TRACE
import { reduceClusteredPoints } from "/modules/03-trace/reduce-clustered-points.js";
import { cleanRegions } from "/modules/clipperjs-wrappers/clean-regions.js";
import { simplifyRegions } from "/modules/clipperjs-wrappers/simplify-regions.js";
import { svgNodeFromPolygons } from "./render/svg-node-from-polygons.js";

// OFFSET
// import { applyOffset } from "/modules/04-offset/apply-offset.js";
import { applyOffsetToRegions } from "/modules/clipperjs-wrappers/apply-offset-to-regions.js";
import { parseSvgViewbox } from "/modules/04-offset/parse-svg-viewbox.js";
// ARRANGE
import {
	visitPoints,
	visitPointsPolygon,
} from "/modules/05-arrange/visit-points.js";

/**
 * UPLOAD
 */
window.onImageSelection = onImageSelection;
window.resetSettings = resetSettings;

/**
 * SILHOUETTE
 */
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
	const {
		thresholdBase64: processedSrc,
		width,
		height,
		widthOriginal,
		heightOriginal,
		scaleFactor,
		blurExtension: paddingBeforeTrace,
	} = await createSilhouette(inputElem.src, radius, threshold, resizeMax);
	// const [processedSrc, width, height] = await processImage(
	// 	inputElem.src,
	// 	radius,
	// 	threshold,
	// 	resizeMax
	// );
	outputElem.src = processedSrc;
	return {
		width,
		height,
		widthOriginal,
		heightOriginal,
		scaleFactor,
		paddingBeforeTrace,
	};
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
		 * @param {string} svgString
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
			// Clean up SVG, the `cleanupTrace` function also renders it out to DOM
			const cleanTracePolygons = cleanupTrace(svgContainerElem);
			// Resolve with the cleaned up polygons
			resolve(cleanTracePolygons);
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
	 *
	 * TODO: split this out... maybe look into an alternative to flattenSVG?
	 * I imagine ClipperJS might be able to handle the flattening...
	 * probably worth looking into.
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
		const { groupId, points: rawPoints } = path;
		const points = reduceClusteredPoints(rawPoints, 3);

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
	 * Clean up with ClipperJS
	 */
	const polygonsCleaned = polygons.map((polygon) => {
		const regionsCleaned = cleanRegions(polygon.regions, 0.2);
		const regionsSimplified = simplifyRegions(regionsCleaned);
		return { regions: regionsSimplified };
	});

	const showDebugPoints = true; // enable to see the issue above
	const viewBox = parseSvgViewbox(svgElem);
	const svgNodeAll = svgNodeFromPolygons(polygonsCleaned, viewBox, {
		showDebug: showDebugPoints,
	});
	svgContainerElem.innerHTML = "";
	svgContainerElem.appendChild(svgNodeAll);

	return polygonsCleaned;
}

/**
 * OFFSET
 *
 * TODO: not shown here cause I couldn't figure out imports and stuff.
 * Might be worth figuring that out so you can clean things up a bit.
 */

function renderAppliedOffset(polygons, offset, svgSrcNode, destNode) {
	const viewBox = parseSvgViewbox(svgSrcNode);
	const viewBoxModded = [
		viewBox[0] - offset,
		viewBox[1] - offset,
		viewBox[2] + offset * 2,
		viewBox[3] + offset * 2,
	];
	const svgNodeFlattened = svgNodeFromPolygons(polygons, viewBoxModded, {
		showDebug: true,
	});
	destNode.innerHTML = "";
	destNode.appendChild(svgNodeFlattened);
}

function applyOffsetV2(
	svgSourceContainerId,
	svgDestContainerId,
	sourcePolygons
) {
	const offset = getInputAsInt("offset");

	const allRegions = [];
	for (const polygon of sourcePolygons) {
		allRegions.push(...polygon.regions);
	}
	const regionsWithOffset = applyOffsetToRegions(allRegions, offset);
	const polygonsWithOffset = [
		{
			regions: regionsWithOffset,
		},
	];

	const svgSourceContainer = document.getElementById(svgSourceContainerId);
	const svgSrcNode = svgSourceContainer.querySelector("svg");
	const destNode = document.getElementById(svgDestContainerId);
	renderAppliedOffset(polygonsWithOffset, offset, svgSrcNode, destNode);
	return [polygonsWithOffset, offset];
}
window.applyOffset = applyOffsetV2;

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
	const reflectedPolygonOffsetY =
		originalBottom * 2 + (baseSize - baseOverlap) * 2;
	const polygonsReflected = visitPoints(rawReflection, ([x, y]) => {
		const offset = reflectedPolygonOffsetY;
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

	const viewBox = getFallbackViewBox(arrangedPolygons, viewBoxPadding);
	const svgNodeArranged = svgNodeFromPolygons(arrangedPolygons, viewBox);
	targetContainer.innerHTML = "";
	targetContainer.appendChild(svgNodeArranged);

	// const svgStringArranged = renderPolygonsAsPathSvg(
	// 	arrangedPolygons,
	// 	viewBoxPadding
	// );
	// targetContainer.innerHTML = svgStringArranged;

	return {
		polygons_arranged: arrangedPolygons,
		scale,
		baseSize,
		baseOverlap,
		boundingWidth,
		boundingHeight,
		boundingBox: { minX, minY, maxX, maxY },
		arrangeOffset: [arrangeOffsetX, arrangeOffsetY],
		reflectedPolygonOffsetY,
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
	console.log({ debugId01, debugId02 });
	// Debug individual shapes
	if (debugId01) {
		const container = document.getElementById(debugId01);
		container.innerHTML = "";
		for (const polygonObj of polygonObjs) {
			const viewBox = getFallbackViewBox([polygonObj], 9);
			container.appendChild(svgNodeFromPolygons([polygonObj], viewBox));
		}
	}

	// Debug arrangement of individual shapes
	if (debugId02) {
		const container = document.getElementById(debugId02);
		container.innerHTML = "";
		const viewBox = getFallbackViewBox(polygonObjs, 9);
		container.appendChild(svgNodeFromPolygons(polygonObjs, viewBox));
	}

	/**
	 * Union of many shapes, as pulled from examples:
	 * https://github.com/velipso/polybooljs?tab=readme-ov-file#advanced-example-1
	 */
	const unionPolygonObj = unionPolygonObjects(polygonObjs);

	// const unionSvg = renderPolygonsAsPathSvg([unionPolygonObj], 9);
	const unionViewBox = getFallbackViewBox([unionPolygonObj], 9);
	const unionSvgNode = svgNodeFromPolygons([unionPolygonObj], unionViewBox);
	// document.getElementById(renderId).innerHTML = unionSvg;
	document.getElementById(renderId).innerHTML = "";
	document.getElementById(renderId).appendChild(unionSvgNode);
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
async function applyLayout(
	polygonObj,
	{
		paddingBeforeTrace: paddingBeforeSilhouette,
		scaleBeforeSilhouette,
		scale: scalePostTrace,
		heightOriginal: imgHeight,
		baseSize,
		baseOverlap,
		baseCenters,
	},
	renderId
) {
	const OUTLINE_COLOR = "#DDDDDD";

	const viewBox = getFallbackViewBox([polygonObj], 9);
	const pathStrings = [polygonObj].map((polygon) => {
		return pathDataStringFromRegions(polygon.regions);
	});

	// Set up the SVG node
	// const [minX, minY, svgWidth, svgHeight] = viewBox;
	const DEV_PADDING = 72;
	const [minX, minY, svgWidth, svgHeight] = [
		viewBox[0] - DEV_PADDING,
		viewBox[1] - DEV_PADDING,
		viewBox[2] + DEV_PADDING * 2,
		viewBox[3] + DEV_PADDING * 2,
	];
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
	 * positioning the top image carefully to match the union'd shape.
	 */
	const imgScaleFinal = scaleBeforeSilhouette * scalePostTrace;
	const scaledPadding = paddingBeforeSilhouette * scalePostTrace;
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
	const imgHeightFinal = imgHeight * imgScaleFinal;
	/**
	 * The "float distance" is the distance between the bottom edge
	 * of the top image and the fold line for the top image.
	 */
	const foldLineTopY = baseCenters[0][1];
	const imgTopLowerY = imgTopY + imgHeightFinal;
	const imgFloatDistance = foldLineTopY - imgTopLowerY;
	/**
	 * The imgBottomBaseOffset is the distance between the top fold line
	 * and the bottom fold line... which is made up of two full bases
	 * (half the top "base", the middle base, and half the bottom base), minus
	 * the overlap between bases (which occurs twice between the three bases).
	 */
	const imgBottomBaseOffset = 2.0 * baseSize - 2.0 * baseOverlap;
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
	const imgNode = buildSvgNode("image", {
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
	const groupNode = buildSvgNode("g");
	const devOutlineNode = buildSvgNode("rect", {
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

window.applyLayout = applyLayout;
