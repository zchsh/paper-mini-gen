var settings = {
	divideXBy: 1,
	divideYBy: 1,
	units: "",
	precision: 3,
};

function pointCommandsToSVGPoints(pointCommands) {
	return pointCommands
		.map(function (value, index, array) {
			return (index % 2 == 1 ? "," : " ") + value;
		})
		.join("");
}

function pointCommandsToCSSPoints(pointCommands, settings) {
	return pointCommands
		.map(function (value, index, array) {
			return (
				(
					value / (index % 2 == 0 ? settings.divideXBy : settings.divideYBy)
				).toFixed(settings.precision) +
				settings.units +
				(index % 2 == 1 && index < array.length - 1 ? "," : "")
			);
		})
		.join(" ");
}

function pathToPoints(segments) {
	var count = segments.numberOfItems;
	var result = [],
		segment,
		x,
		y;
	for (var i = 0; i < count; i++) {
		segment = segments.getItem(i);
		switch (segment.pathSegType) {
			case SVGPathSeg.PATHSEG_MOVETO_ABS:
			case SVGPathSeg.PATHSEG_LINETO_ABS:
			case SVGPathSeg.PATHSEG_CURVETO_CUBIC_ABS:
			case SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_ABS:
			case SVGPathSeg.PATHSEG_ARC_ABS:
			case SVGPathSeg.PATHSEG_CURVETO_CUBIC_SMOOTH_ABS:
			case SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_SMOOTH_ABS:
				x = segment.x;
				y = segment.y;
				break;

			case SVGPathSeg.PATHSEG_MOVETO_REL:
			case SVGPathSeg.PATHSEG_LINETO_REL:
			case SVGPathSeg.PATHSEG_CURVETO_CUBIC_REL:
			case SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_REL:
			case SVGPathSeg.PATHSEG_ARC_REL:
			case SVGPathSeg.PATHSEG_CURVETO_CUBIC_SMOOTH_REL:
			case SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_SMOOTH_REL:
				x = segment.x;
				y = segment.y;
				if (result.length > 0) {
					x += result[result.length - 2];
					y += result[result.length - 1];
				}
				break;

			case SVGPathSeg.PATHSEG_LINETO_HORIZONTAL_ABS:
				x = segment.x;
				y = result[result.length - 1];
				break;
			case SVGPathSeg.PATHSEG_LINETO_HORIZONTAL_REL:
				x = result[result.length - 2] + segment.x;
				y = result[result.length - 1];
				break;

			case SVGPathSeg.PATHSEG_LINETO_VERTICAL_ABS:
				x = result[result.length - 2];
				y = segment.y;
				break;
			case SVGPathSeg.PATHSEG_LINETO_VERTICAL_REL:
				x = result[result.length - 2];
				y = segment.y + result[result.length - 1];
				break;
			case SVGPathSeg.PATHSEG_CLOSEPATH:
				return result;
			default:
				console.log("unknown path command: ", segment.pathSegTypeAsLetter);
		}
		result.push(x, y);
	}
	return result;
}

function buildSvgNode(n, v) {
	n = document.createElementNS("http://www.w3.org/2000/svg", n);
	for (var p in v) n.setAttributeNS(null, p, v[p]);
	return n;
}

function convertPathsToPolygon(svgElem) {
	console.log(svgElem);
	var viewPort = svgElem.getAttribute("viewBox");
	if (!viewPort)
		viewPort =
			"x:" +
			svgElem.getAttribute("x") +
			" y:" +
			svgElem.getAttribute("y") +
			" width:" +
			svgElem.getAttribute("width") +
			" height:" +
			svgElem.getAttribute("height");
	var paths = svgElem.querySelectorAll("path");
	for (var i = 0; i < paths.length; i++) {
		var path = paths[i];
		var points = pathToPoints(path.pathSegList);
		var polygonSVGPoints = pointCommandsToSVGPoints(points);
		const polygon = buildSvgNode("polygon", {
			points: polygonSVGPoints,
			fill: "transparent",
			stroke: "rgba(255,0,255,0.6)",
			"stroke-width": 1,
		});

		path.parentNode.replaceChild(polygon, path);
	}
}
