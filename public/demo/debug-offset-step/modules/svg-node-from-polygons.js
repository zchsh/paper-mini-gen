import { buildPathNode } from "./build-path-node.js";
import { buildSvgRootNode } from "./build-svg-root-node.js";
import { buildRegionDebugGroup } from "./build-region-debug-group.js";

/**
 * Given an array of polygons, and a viewBox,
 * Return an SVG node with a <path> element to represent the shape,
 * and <circle> elements to highlight individual points.
 *
 * A polygon is an object with a `regions` property.
 * The `regions` property is an array of regions.
 * A region is an array of [x, y] points.
 *
 * @param {{ regions: [number, number][][]}} polygons - An array of polygons objects
 * @returns {SVGElement} An SVG node with the path and points
 */
export function svgNodeFromPolygons(
	polygons,
	viewBox,
	{ showDebug, debugColor1, debugColor2 } = {
		showDebug: false,
		debugColor1: "magenta",
		debugColor2: "blue",
	}
) {
	// Set up a root <svg> node, and add in the <path> and <circle> nodes
	const svgNode = buildSvgRootNode(viewBox);
	// Iterate over the polygons, adding paths and circles for each
	for (const polygon of polygons) {
		// Get a <path> node from the polygon regions
		const pathNode = buildPathNode(polygon.regions, debugColor1);
		svgNode.appendChild(pathNode);
		// For each region, add <circle> nodes to highlight points, and
		// chevron-like lines to show winding direction
		if (showDebug) {
			for (const region of polygon.regions) {
				svgNode.appendChild(buildRegionDebugGroup(region, debugColor2));
			}
		}
	}
	return svgNode;
}
