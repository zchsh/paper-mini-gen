import { createSvgElem } from "./create-svg-elem.js";
import { getChevronVectors } from "./get-chevron-vectors.js";

/**
 * Given a region, which is an array of [x, y] points,
 * Return an SVG <g> node with <circle> elements for each point,
 * and <line> elements for chevrons between each point indicating
 * the winding direction of the region.
 *
 * @param {[number, number][]} region - An array of [x, y] points
 * @param {string} debugColor - The color for the debug elements
 * @returns {SVGElement} An SVG <g> node with <circle> and <line> elements
 */
export function buildRegionDebugGroup(
	region,
	debugColor = "rgba(0,0,255,0.8)"
) {
	if (!region || region.length < 3) {
		throw new Error(
			"Invalid region in buildRegionDebugGroup: must be an array of at least 3 points"
		);
	}
	const debugStrokeWidth = 0.5;
	const dotSize = 1;
	const chevronLength = 5;
	const chevronAngle = 30;
	// Make note of the starting point
	const [startX, startY] = region[0];
	// Build vector data for chevrons at each point
	const allChevronVectors = [];
	for (let i = 1; i < region.length; i++) {
		const chevronVectors = getChevronVectors(
			region[i - 1],
			region[i],
			chevronLength,
			chevronAngle
		);
		allChevronVectors.push(...chevronVectors);
	}
	// Render the start point node
	const startPointNode = createSvgElem("circle", {
		cx: startX,
		cy: startY,
		r: dotSize * 3,
		stroke: debugColor,
		"stroke-width": debugStrokeWidth,
		fill: "none",
	});
	// Render line segment nodes for each chevron
	const chevronLineNodes = allChevronVectors.map((chevronVector) => {
		const { x1, y1, x2, y2 } = chevronVector;
		return createSvgElem("line", {
			x1,
			y1,
			x2,
			y2,
			stroke: debugColor,
			"stroke-width": debugStrokeWidth,
		});
	});
	// Render circle nodes for each point
	const circleNodes = region.map(([cx, cy]) => {
		return createSvgElem("circle", {
			cx,
			cy,
			r: dotSize,
			fill: debugColor,
		});
	});
	// Render and return a <g> node with all the elements as children
	const groupNode = createSvgElem("g", {});
	for (const circleNode of circleNodes) {
		groupNode.appendChild(circleNode);
	}
	groupNode.appendChild(startPointNode);
	for (const chevronLineNode of chevronLineNodes) {
		groupNode.appendChild(chevronLineNode);
	}
	return groupNode;
}
