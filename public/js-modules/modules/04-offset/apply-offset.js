/* https://danmarshall.github.io/svg-path-outline/ */
var spo = require("svg-path-outline");

function buildSvgNode(n, v) {
	n = document.createElementNS("http://www.w3.org/2000/svg", n);
	for (var p in v) n.setAttributeNS(null, p, v[p]);
	return n;
}

function getInputAsInt(inputId) {
	return parseInt(document.getElementById(inputId).value);
}

function applyOffset(svgSourceContainerId, svgDestContainerId = null) {
	const svgSourceContainer = document.getElementById(svgSourceContainerId);
	const svgSource = svgSourceContainer.querySelector("svg");
	let svgDest;
	if (svgDestContainerId !== null) {
		const svgDestContainer = document.getElementById(svgDestContainerId);
		svgDestContainer.innerHTML = svgSource.parentNode.innerHTML;
		svgDest = svgDestContainer.querySelector("svg");
	} else {
		svgDest = svgSource;
	}

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
	 * Convert path, which probs include curves, to straight lines
	 */
	const polygons = flattenSvgToPaths(svgDest);
	const viewBox = parseSvgViewbox(svgDest);
	const viewBoxModded = [
		viewBox[0] - offset,
		viewBox[1] - offset,
		viewBox[2] + offset * 2,
		viewBox[3] + offset * 2,
	];
	const svgStringAll = renderPolygonsAsPathSvg(polygons, viewBoxModded);
	//
	svgDest.parentNode.innerHTML = svgStringAll;

	return [polygons, offset];
}

window.applyOffset = applyOffset;
