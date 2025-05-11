import { buildPathNode } from "./build-path-node.js";
import { buildCircleNodesFromPoints } from "./build-circle-nodes-from-points.js";
import { buildSvgRootNode } from "./build-svg-root-node.js";

/**
 * Given an array of [x, y] points, and a viewBox,
 * Return an SVG node with a <path> element to represent the shape,
 * and <circle> elements to highlight individual points.
 *
 * @param {number[][]} points - An array of [x, y] points
 * @returns {SVGElement} An SVG node with the path and points
 */
export function svgNodeFromPoints(points, viewBox) {
	// Get a <path> node from the points, and <circle> nodes to mark points
	const pathNode = buildPathNode(points);
	const pointNodes = buildCircleNodesFromPoints(points);
	// Set up a root <svg> node, and add in the <path> and <circle> nodes
	const svgNode = buildSvgRootNode(viewBox);
	svgNode.appendChild(pathNode);
	for (const pointNode of pointNodes) {
		svgNode.appendChild(pointNode);
	}
	return svgNode;
}
