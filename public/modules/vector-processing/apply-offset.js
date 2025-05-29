// OFFSET
import { applyOffsetToRegions } from "./clipperjs-wrappers/apply-offset-to-regions.js";

export function applyOffset(sourcePolygons, offset) {
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
	return polygonsWithOffset;
}
