import { createSvgElem } from "./create-svg-elem.js";
import { pathDataStringFromRegions } from "./path-data-string-from-regions.js";

export function buildPathNode(points) {
	const pathNode = createSvgElem("path", {
		d: pathDataStringFromRegions([points]),
		fill: "rgba(255,0,255,0.3)",
		stroke: "rgba(255,0,255,0.7)",
		"stroke-width": "0.5",
	});
	return pathNode;
}
