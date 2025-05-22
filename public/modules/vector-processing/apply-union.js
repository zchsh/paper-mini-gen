// COMMON
import { getFallbackViewBox } from "/modules/00-common/get-fallback-viewbox.js";
import { svgNodeFromPolygons } from "../render/svg-node-from-polygons.js";

/**
 * UNION
 *
 * TODO: finish and clean up below
 */
export function applyUnion(polygonObjs, renderId, debugId01, debugId02) {
	// Debug individual shapes
	if (debugId01) {
		const container = document.getElementById(debugId01);
		container.innerHTML = "";
		for (const polygonObj of polygonObjs) {
			const viewBox = getFallbackViewBox([polygonObj], 9);
			container.appendChild(svgNodeFromPolygons([polygonObj], viewBox));
		}
	}

	// Debug arrangement of individual shapes
	if (debugId02) {
		const container = document.getElementById(debugId02);
		container.innerHTML = "";
		const viewBox = getFallbackViewBox(polygonObjs, 9);
		container.appendChild(svgNodeFromPolygons(polygonObjs, viewBox));
	}

	/**
	 * Union of many shapes, as pulled from examples:
	 * https://github.com/velipso/polybooljs?tab=readme-ov-file#advanced-example-1
	 */
	const unionPolygonObj = unionPolygonObjects(polygonObjs);

	// const unionSvg = renderPolygonsAsPathSvg([unionPolygonObj], 9);
	const unionViewBox = getFallbackViewBox([unionPolygonObj], 9);
	const unionSvgNode = svgNodeFromPolygons([unionPolygonObj], unionViewBox);
	// document.getElementById(renderId).innerHTML = unionSvg;
	document.getElementById(renderId).innerHTML = "";
	document.getElementById(renderId).appendChild(unionSvgNode);
	return unionPolygonObj;
}

/**
 * TODO: could probably swap in ClipperJS here?
 *
 * @param {*} polygons
 * @returns
 */
function unionPolygonObjects(polygons) {
	var segments = PolyBool.segments(polygons[0]);
	for (var i = 1; i < polygons.length; i++) {
		var seg2 = PolyBool.segments(polygons[i]);
		var comb = PolyBool.combine(segments, seg2);
		segments = PolyBool.selectUnion(comb);
	}
	return PolyBool.polygon(segments);
}
