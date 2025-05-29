import { getBoundingPoints } from "../vector-processing/get-bounding-points.js";

export function getFallbackViewBox(polygons, rawPadding) {
	const allPoints = polygons.map((p) => p.regions.flat()).flat();
	const { minX, minY, maxX, maxY } = getBoundingPoints(allPoints);
	const viewBoxPadding = typeof rawPadding === "number" ? rawPadding : 0;
	const svgWidth = maxX - minX + viewBoxPadding * 2;
	const svgHeight = maxY - minY + viewBoxPadding * 2;
	const viewBox = [
		minX - viewBoxPadding,
		minY - viewBoxPadding,
		svgWidth,
		svgHeight,
	];
	return viewBox;
}
