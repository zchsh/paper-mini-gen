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

const PIXELS_PER_INCH = 72;
const MM_PER_INCH = 25.4;

/**
 * ARRANGEMENT
 *
 * TODO: finish and clean up below
 */
export function arrangeForUnion(polygons) {
	/**
	 * Split out the below
	 * Generate circular base shapes around the polygons
	 */
	const baseSizeMm = getInputAsInt("baseSizeMm");
	const points = polygons.map((p) => p.regions.flat()).flat();
	const { minX, minY, maxX, maxY } = getBoundingPoints(points);

	const boundingHeight = maxY - minY;
	const boundingCenterX = (minX + maxX) / 2;

	const originalBottom = minY + boundingHeight;

	// Add some circular polygons for the base and stuff

	const baseSize = baseSizeMm * (PIXELS_PER_INCH / MM_PER_INCH);
	const baseOverlap = Math.ceil(baseSize / 10);

	const rawBaseCenters = [
		[boundingCenterX, originalBottom],
		[boundingCenterX, originalBottom + baseSize - baseOverlap],
		[boundingCenterX, originalBottom + (baseSize - baseOverlap) * 2],
	];

	/**
	 * Split out the below
	 * Apply arrangement offset to the base centers
	 *
	 * NOTE: that arrangeOffsetY is also applied to the reflected polygons.
	 */
	const arrangeOffsetX = getInputAsInt("arrangeOffsetX");
	const arrangeOffsetY = getInputAsInt("arrangeOffsetY");

	// Add X and Y offset. Note that we move the "base" pieces,
	// and leave the original piece in place.
	/**
	 * TODO: consider how baseCenters is used elsewhere...
	 * maybe worth trying out different ways of splitting things out?
	 */
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

	//

	/**
	 * Split out the below
	 * Add a reflected duplicate for the "other side"
	 */
	const rawReflection = visitPoints(polygons, ([x, y]) => {
		return [x, y * -1];
	});
	const reflectedPolygonOffsetY =
		originalBottom * 2 + (baseSize - baseOverlap) * 2;
	const polygonsReflected = visitPoints(rawReflection, ([x, y]) => {
		const offset = reflectedPolygonOffsetY;
		return [x, y + offset];
	});

	/**
	 * Split out the below - combining the polygons
	 * and the circular bases into one big array of polygons
	 */
	const polygonsArranged = [
		...polygons,
		...translatePolygons(polygonsReflected, [0, arrangeOffsetY * 2]),
		circleBaseTop,
		circleBase,
		circleBaseBottom,
	];

	return {
		baseCenters,
		baseOverlap,
		baseSize,
		polygonsArranged,
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
