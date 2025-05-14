import { createSvgElem } from "./create-svg-elem.js";
import { pathDataStringFromRegions } from "./path-data-string-from-regions.js";

export function buildPathNode(regions, pathColor = "rgba(255,0,255,0.5)") {
	const pathNode = createSvgElem("path", {
		d: pathDataStringFromRegions(regions),
		fill: pathColor,
		stroke: pathColor,
		"stroke-width": "0.5",
	});
	return pathNode;
}
