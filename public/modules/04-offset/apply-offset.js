import { buildSvgRootNode } from "/modules/00-common/build-svg-root-node.js";

import { svgNodeFromPolygons } from "/modules/00-common/svg-node-from-polygons.js";
import { pathDataStringFromRegions } from "/modules/00-common/path-data-string-from-regions.js";
// From https://danmarshall.github.io/svg-path-outline/
import { outline as spo } from "/modules/04-offset/svg-path-outline.js";
import { parseSvgViewbox } from "/modules/04-offset/parse-svg-viewbox.js";

function buildSvgNode(n, v) {
	n = document.createElementNS("http://www.w3.org/2000/svg", n);
	for (var p in v) n.setAttributeNS(null, p, v[p]);
	return n;
}

function getInputAsInt(inputId) {
	return parseInt(document.getElementById(inputId).value);
}

/**
 * TODO: use sourcePolygons... maybe with some offset library
 * that plays nicely with simple arrays of points?
 *
 * Maybe Clipper:
 * https://sourceforge.net/p/jsclipper/wiki/Home%206/
 */
export function applyOffset(
	svgSourceContainerId,
	svgDestContainerId,
	sourcePolygons
) {
	const svgSourceContainer = document.getElementById(svgSourceContainerId);
	const svgSource = svgSourceContainer.querySelector("svg");
	let svgDest;
	if (svgDestContainerId !== null) {
		const svgDestContainer = document.getElementById(svgDestContainerId);
		svgDestContainer.innerHTML = svgSource.parentNode.innerHTML;
		/**
		 * Remove any dot markers from previous step.
		 * TODO: ideally, also operate on polygon data passed between steps
		 * as arguments... this would remove the need for this finagling.
		 * But, haven't gotten there yet, need to rejig how the whole
		 * offset thing works so it doesn't rely on the SVG DOM I think?
		 * Maybe similar to previous steps... make an SVG node from the incoming
		 * polygon data, operate on it, then convert it back to polygons?
		 */
		const dotMarkers = svgDestContainer.querySelectorAll("circle");
		for (const dotMarker of dotMarkers) {
			dotMarker.remove();
		}
		svgDest = svgDestContainer.querySelector("svg");
	} else {
		svgDest = svgSource;
	}

	console.log({ sourcePolygons, svgDest });

	const offset = getInputAsInt("offset");
	// From each polygon element, generate an offset path element
	const pathElems = svgDest.querySelectorAll("path");
	for (const pathElem of pathElems) {
		const pathData = pathElem.getAttribute("d");
		const outlineData = spo(pathData, offset, { tagName: "path" });
		const outlinePath = buildSvgNode("path", {
			d: outlineData,
			fill: "rgba(255,0,255,0.444)",
		});
		svgDest.appendChild(outlinePath);
		pathElem.remove();
	}

	/**
	 * Construct a new SVG node, where we'll create all the "outlined" polygons
	 */
	const sourceViewBox = parseSvgViewbox(svgSource);
	const svgNode = buildSvgRootNode(sourceViewBox);

	for (const sourcePolygon of sourcePolygons) {
		const pathData = pathDataStringFromRegions(sourcePolygon.regions);
		const outlineData = spo(pathData, offset, { tagName: "path" });
		const outlinePath = buildSvgNode("path", {
			d: outlineData,
			fill: "rgba(255,0,255,0.444)",
		});
		svgNode.appendChild(outlinePath);
	}
	/**
	 * Convert path, which probs include curves, to straight lines
	 */
	const polygons = flattenSvgToPaths(svgNode);
	// const polygons = sourcePolygons;
	const viewBox = parseSvgViewbox(svgNode);
	const viewBoxModded = [
		viewBox[0] - offset,
		viewBox[1] - offset,
		viewBox[2] + offset * 2,
		viewBox[3] + offset * 2,
	];
	const svgNodeAll = svgNodeFromPolygons(polygons, viewBoxModded, true);
	// const svgStringAll = renderPolygonsAsPathSvg(polygons, viewBoxModded);
	//
	// svgDest.parentNode.innerHTML = svgStringAll;
	const parentNode = svgDest.parentNode;
	parentNode.innerHTML = "";
	parentNode.appendChild(svgNodeAll);

	return [polygons, offset];
}
