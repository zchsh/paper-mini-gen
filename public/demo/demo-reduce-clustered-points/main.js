import { reduceClusteredPoints } from "./modules/reduce-clustered-points.js";
import { pointsFromPathDataString } from "./modules/points-from-path-data-string.js";
import { svgNodeFromPoints } from "./modules/svg-node-from-points.js";

// Note: we assume a viewBox of 0 0 100 100 for all examples
const examplePathDataStrings = [
	"M29 32.5V70H70.5V32.5L68.5 31L29 32.5Z",
	"M24 58.5L21.5 60L50 72.5L77.5 53L66.5 36.5L68.5 35.5L66.5 33.5L31.5 38.5L20 57L24 58.5Z",
];

export function runExamples() {
	/**
	 * NOTE: we assume a viewBox of 0 0 100 100 for all examples.
	 * There could be a smarter way to go about this, but for now,
	 * I find it easy to put all the examples I want to test
	 * in the same size viewBox.
	 */
	const viewBox = [0, 0, 100, 100];
	/**
	 * Convert the provided example path data strings into regions.
	 * Each region is an array of points, each point is an [x, y] tuple.
	 */
	const exampleRegions = examplePathDataStrings.map((pathDataString) => {
		return pointsFromPathDataString(pathDataString);
	});
	/**
	 * Render each example region
	 */
	for (const regionBefore of exampleRegions) {
		// Remove redundant points from the region
		const regionAfter = reduceClusteredPoints(regionBefore);
		/**
		 * Render before and after SVGs from regionBefore and regionAfter
		 */
		// Set up a container to hold the example
		const container = document.createElement("div");
		container.className = "example-container";
		// The "before" div will hold the original SVG
		const before = document.createElement("div");
		before.className = "example-before";
		const svgBefore = svgNodeFromPoints(regionBefore, viewBox);
		before.appendChild(svgBefore);
		container.appendChild(before);
		// The "after" div will hold the SVG with redundant points removed
		const after = document.createElement("div");
		after.className = "example-after";
		const svgAfter = svgNodeFromPoints(regionAfter, viewBox);
		after.appendChild(svgAfter);
		container.appendChild(after);
		// Append the container to the body
		document.body.appendChild(container);
	}
}
