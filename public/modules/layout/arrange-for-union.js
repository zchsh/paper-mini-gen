// COMMON
import { getInputAsInt } from "/modules/00-common/get-input-as-int.js";
import { getFallbackViewBox } from "/modules/00-common/get-fallback-viewbox.js";
import { getBoundingPoints } from "/modules/00-common/get-bounding-points.js";
import { svgNodeFromPolygons } from "../render/svg-node-from-polygons.js";
// ARRANGE
import {
	visitPoints,
	visitPointsPolygon,
} from "/modules/05-arrange/visit-points.js";

/**
 * ARRANGEMENT
 *
 * TODO: finish and clean up below
 */
export function arrangeForUnion(rawPolygons, targetContainer) {
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
