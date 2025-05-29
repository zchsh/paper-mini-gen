import { getBoundingPoints } from "/modules/00-common/get-bounding-points.js";
import { visitPointsPolygon } from "/modules/05-arrange/visit-points.js";

const PIXELS_PER_INCH = 72;
const MM_PER_INCH = 25.4;

/**
 * TODO: write description
 *
 * @param {*} polygons
 * @param {*} scaleFactor
 * @returns
 */
function scalePolygons(polygons, scaleFactor) {
	return polygons.map((polygon) => {
		return visitPointsPolygon(polygon, ([x, y]) => {
			return [x * scaleFactor, y * scaleFactor];
		});
	});
}

/**
 * TODO: write description
 *
 * @param {*} polygons
 * @returns
 */
function getPolygonsHeightMm(polygons) {
	const allPoints = polygons.map((p) => p.regions.flat()).flat();
	const boundingBox = getBoundingPoints(allPoints);
	const heightInPixels = boundingBox.maxY - boundingBox.minY;
	return (heightInPixels / PIXELS_PER_INCH) * MM_PER_INCH;
}

/**
 * TODO: write description
 *
 * @param {*} polygons
 * @param {*} heightInputMm
 * @returns
 */
export function scaleToTargetHeight(polygons, heightInputMm) {
	// Determine the scale factor to meet the target height in mm
	const heightRawMm = getPolygonsHeightMm(polygons);
	const scaleFactor = heightInputMm / heightRawMm;
	// Scale the polygons, and return along with the scale factor
	const scaledPolygons = scalePolygons(polygons, scaleFactor);
	return [scaledPolygons, scaleFactor];
}
