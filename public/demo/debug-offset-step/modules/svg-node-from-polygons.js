import { buildPathNode } from "./build-path-node.js";
import { buildCircleNodesFromPoints } from "./build-circle-nodes-from-points.js";
import { buildSvgRootNode } from "./build-svg-root-node.js";

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
export function svgNodeFromPolygons(polygons, viewBox, debugPoints = false) {
	// Set up a root <svg> node, and add in the <path> and <circle> nodes
	const svgNode = buildSvgRootNode(viewBox);
	// Iterate over the polygons, adding paths and circles for each
	for (const polygon of polygons) {
		// Get a <path> node from the polygon regions
		const pathNode = buildPathNode(polygon.regions);
		svgNode.appendChild(pathNode);
		// For each region, add <circle> nodes to highlight points
		/**
		 * TODO: add chevrons to indicate winding direction
		 * See notes in sketchbook, would like to able to adjust
		 * size and angle of chevrons.
		 * Start by drawing partial line segment - already shows direction,
		 * just not as clear. Then clone and rotate that line segment to form
		 * the two lines of the chevron.
		 */
		if (debugPoints) {
			for (const region of polygon.regions) {
				const pointNodes = buildCircleNodesFromPoints(region);
				for (const pointNode of pointNodes) {
					svgNode.appendChild(pointNode);
				}
			}
		}
	}
	return svgNode;
}
