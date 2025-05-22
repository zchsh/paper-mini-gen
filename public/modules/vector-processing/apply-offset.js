// COMMON
import { getInputAsInt } from "/modules/00-common/get-input-as-int.js";
import { svgNodeFromPolygons } from "../render/svg-node-from-polygons.js";
// OFFSET
import { applyOffsetToRegions } from "/modules/clipperjs-wrappers/apply-offset-to-regions.js";
import { parseSvgViewbox } from "/modules/04-offset/parse-svg-viewbox.js";

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

export function applyOffset(
	svgSourceContainerId,
	svgDestContainerId,
	sourcePolygons,
	offset
) {
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
	return polygonsWithOffset;
}
