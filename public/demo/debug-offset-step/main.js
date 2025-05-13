import { regionsFromPathDataString } from "/demo/debug-offset-step/modules/parse/regions-from-path-data-string.js";
import { svgNodeFromPolygons } from "/demo/debug-offset-step/modules/render/svg-node-from-polygons.js";
import { applyOffsetToRegions } from "/demo/debug-offset-step/modules/clipperjs-wrappers/apply-offset-to-regions.js";
import { simplifyRegions } from "/demo/debug-offset-step/modules/clipperjs-wrappers/simplify-regions.js";
import { cleanRegions } from "/demo/debug-offset-step/modules/clipperjs-wrappers/clean-regions.js";

/**
 * NOTE: EXAMPLES is expected to be declared in the global scope
 */

/**
 * Given an individual example object,
 * Return an array of SVG nodes for the before, simplified, and offset regions.
 */
function runExample({ pathData, viewBox }, offsetAmount) {
	const regions = regionsFromPathDataString(pathData);
	/**
	 * Render a "before" element, for comparison
	 */
	const beforeSvgNode = svgNodeFromPolygons([{ regions }], viewBox, {
		showDebug: true,
		debugColor1: "rgba(255,0,255,0.3)",
		debugColor2: "rgba(255,0,255,0.8)",
	});

	/**
	 * Ensure the region has no self-intersections, render the result
	 */
	const regionsCleaned = cleanRegions(regions, 0.5);
	const regionsSimplified = simplifyRegions(regionsCleaned);
	const simplifiedRegionNode = svgNodeFromPolygons(
		[{ regions: regionsSimplified }],
		viewBox,
		{
			showDebug: true,
			debugColor1: "rgba(128,0,255,0.3)",
			debugColor2: "rgba(128,0,255,0.8)",
		}
	);

	/**
	 * Apply the offset to the simplified regions, and render the result
	 */
	const rawOffsetRegions = applyOffsetToRegions(
		regionsSimplified,
		offsetAmount
	);
	/**
	 * Clean the offset regions, and render the result
	 *
	 * TODO: could add user-facing control over the clean threshold.
	 * Alternately... should maybe keep the "clean" threshold pretty low,
	 * and later add a true path smoothing step... see NOTES.md for more,
	 * I think the latest is I might want to explore using:
	 * https://mourner.github.io/simplify-js/
	 */
	const offsetRegions = cleanRegions(rawOffsetRegions, 0.5);
	// const offsetRegions = rawOffsetRegions;
	const offsetPolygon = { regions: offsetRegions };
	const offsetNode = svgNodeFromPolygons([offsetPolygon], viewBox, {
		showDebug: true,
		debugColor1: "rgba(0,128,255,0.3)",
		debugColor2: "rgba(0,128,255,0.8)",
	});
	return [beforeSvgNode, simplifiedRegionNode, offsetNode];
}

// The amount by which to offset each example
const OFFSET_AMOUNT = 12;

/**
 * Run `EXAMPLES` from the global scope, and render out
 * some SVG previews to the document body.
 */
function runExamples() {
	/**
	 * Puff out the viewBox of each example a bit, so we have offset space
	 */
	const examplesPrepared = EXAMPLES.map((example) => {
		const { pathData, viewBox: rawViewBox } = example;
		const extraPadding = OFFSET_AMOUNT * 2;
		const viewBox = [
			rawViewBox[0] - extraPadding,
			rawViewBox[1] - extraPadding,
			rawViewBox[2] + extraPadding * 2,
			rawViewBox[3] + extraPadding * 2,
		];
		return { pathData, viewBox };
	});

	/**
	 * Render each of the examples
	 */
	for (const example of examplesPrepared) {
		const [beforeSvgNode, simplifiedRegionNode, offsetNode] = runExample(
			example,
			OFFSET_AMOUNT
		);
		document.body.append(beforeSvgNode);
		document.body.append(simplifiedRegionNode);
		document.body.append(offsetNode);
		// Create a divider before the next example
		document.body.append(document.createElement("hr"));
	}
}

window.runExamples = runExamples;
