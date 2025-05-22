import { buildSvgRootNode } from "./build-svg-root-node.js";
import { createSvgElem } from "./create-svg-elem.js";

/**
 * Given an array of path data strings, create an <svg> element,
 * and append <path> elements to it for each path data string, and
 * Return an <svg> element representing the paths.
 *
 * @param {string[]} pathDataStrings
 * @param {number} width
 * @param {number} height
 * @return {SVGElement}
 */
export function renderPathDataStrings(pathDataStrings, width, height) {
	const viewBox = [0, 0, width, height];
	console.log({ viewBox });
	const svgRootNode = buildSvgRootNode(viewBox);
	for (const pathDataString of pathDataStrings) {
		const pathElem = createSvgElem("path", {
			d: pathDataString,
			fill: "none",
			stroke: "black",
			"stroke-width": 1,
		});
		svgRootNode.appendChild(pathElem);
	}
	// Return the SVG element
	return svgRootNode;
}
