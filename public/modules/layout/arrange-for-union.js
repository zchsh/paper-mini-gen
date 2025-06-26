import { getBoundingPoints } from "../vector-processing/get-bounding-points.js";
import { translatePolygons } from "../vector-processing/translate-polygons.js";
import { visitPoints } from "../vector-processing/visit-points.js";
import { createCircularPolygon } from "../vector-processing/create-circular-polygon.js";

/**
 * Given a set of polygons, representing the traced shape of art for a paper
 * miniature, as well as settings for the base size and arrangement tweaks,
 * Return a new set of polygons that includes the original traced polygons,
 * a reflected duplicate of the traced polygons for the reverse side of the
 * paper miniature, and circular base shapes that will join the front and back
 * of the paper miniature together and provide a stable base.
 *
 * @param {{ regions: [number, number][][]}[]} polygons - The traced polygons representing the art.
 * @param {Object} options - Options for arranging the polygons.
 * @param {number} options.baseSizeMm - The size of the circular base in millimeters.
 * @param {number} options.arrangeOffsetX - The horizontal offset to apply to the arrangement.
 * @param {number} options.arrangeOffsetY - The vertical offset to apply to the arrangement.
 * @returns {[{ regions: [number, number][][]}[], { centers, overlap, size }]} - An array containing the arranged polygons, and some metrics about the base shapes that were generated and added.
 */
export function arrangeForUnion(
	polygons,
	{ baseSize, arrangeOffsetX, arrangeOffsetY }
) {
	// Determine the base overlap, based on the base size
	const baseOverlap = Math.ceil(baseSize / 10);
	/**
	 * Generate circular base shapes, positioned based on the polygons
	 */
	// Determine the min-max bounds of the polygons
	const points = polygons.map((p) => p.regions.flat()).flat();
	const { minX, maxX, maxY } = getBoundingPoints(points);
	// Get the x position at the center of the polygons.
	// This determines the default placement of the circular base
	const boundingCenterX = (minX + maxX) / 2;
	// Generate base centers based on the default placement
	const baseCentersDefault = [
		[boundingCenterX, maxY],
		[boundingCenterX, maxY + baseSize - baseOverlap],
		[boundingCenterX, maxY + (baseSize - baseOverlap) * 2],
	];
	/**
	 * Apply user-provided offsets to the base centers
	 */
	const baseCenters = baseCentersDefault.map(([x, y]) => {
		return [x - arrangeOffsetX, y + arrangeOffsetY];
	});
	/**
	 * Create circular polygons for each base
	 */
	const circleVertexCount = 36;
	const circleBase = {
		regions: [
			createCircularPolygon(baseSize / 2, circleVertexCount, baseCenters[0]),
		],
	};
	const circleBaseTop = {
		regions: [
			createCircularPolygon(baseSize / 2, circleVertexCount, baseCenters[1]),
		],
	};
	const circleBaseBottom = {
		regions: [
			createCircularPolygon(baseSize / 2, circleVertexCount, baseCenters[2]),
		],
	};
	/**
	 * Add a reflected duplicate of the traced polygons for the reverse side
	 * of the paper miniature.
	 */
	// Reflect the polygons about the origin
	const polygonsReflectedAboutOrigin = visitPoints(polygons, ([x, y]) => {
		return [x, y * -1];
	});
	// Determine the offset to get the polygons positioned by the last base
	const reflectedPolygonOffsetY = maxY * 2 + (baseSize - baseOverlap) * 2;
	// Translate the reflected polygons to their new position
	const polygonsReflected = translatePolygons(polygonsReflectedAboutOrigin, [
		0,
		reflectedPolygonOffsetY + arrangeOffsetY * 2,
	]);
	/**
	 * We need to reverse the order of the regions in each of our reflected
	 * polygons, so that the winding order is correct
	 */
	const polygonsReflectedReversed = polygonsReflected.map((polygon) => {
		return {
			regions: polygon.regions.map((region) => {
				return region.slice().reverse();
			}),
		};
	});
	/**
	 * Combine the original trace polygons, the reflected polygons,
	 * and the circular bases into one big array of polygons
	 */
	const polygonsArranged = [
		...polygons,
		circleBaseTop,
		circleBase,
		circleBaseBottom,
		...polygonsReflectedReversed,
	];
	// Return the arrange polygons, and bundle of info about the bases we added
	const baseData = {
		centers: baseCenters,
		overlap: baseOverlap,
		size: baseSize,
	};
	return [polygonsArranged, baseData];
}
