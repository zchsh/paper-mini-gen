export function outline(svgData, distance, opts) {
	var defaultOptions = {
		bezierAccuracy: 0.25,
		joints: 0,
		outside: true,
		tagName: "path",
	};
	var o = makerjs.extendObject(defaultOptions, opts);
	var closed = true;
	var input;
	switch (o.tagName) {
		case "polyline":
			closed = false;
		//fall through
		case "polygon":
			//use points.
			//Need to mirror them on y axis because they are expected to be in MakerJs coordinate space
			input = makerjs.model.mirror(
				new makerjs.models.ConnectTheDots(closed, svgData),
				false,
				true
			);
			break;
		default:
			input = makerjs.importer.fromSVGPathData(svgData, {
				bezierAccuracy: o.bezierAccuracy,
			});
			break;
	}
	var result;
	if (o.inside && o.outside) {
		result = makerjs.model.expandPaths(input, distance, o.joints);
	} else {
		result = makerjs.model.outline(input, distance, o.joints, o.inside);
	}
	makerjs.model.simplify(result);
	return makerjs.exporter.toSVGPathData(result, false, [0, 0]);
}
