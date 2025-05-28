/**
 * TODO: CLEAN UP BELOW.
 *
 *
 *
 *
 *
 * Split out from:
 * https://github.com/jankovicsandras/imagetracerjs/blob/master/imagetracer_v1.2.6.js
 *
 */

/**
 * TODO: pare this down.
 * Since this `pathDataStringsFromTraceData` function is meant only to
 * convert existing traced data into SVG path data strings,
 * I SUSPECT (or maybe HOPE) that most of the "options" here are irrelevant...
 * and we can instead have a simpler set of default arguments for a purely
 * functional approach to converting the traced data into SVG path data strings.
 */
const OPTION_PRESETS = {
	default: {
		// Tracing
		corsenabled: false,
		ltres: 1,
		qtres: 1,
		pathomit: 8,
		rightangleenhance: true,

		// Color quantization
		colorsampling: 2,
		numberofcolors: 16,
		mincolorratio: 0,
		colorquantcycles: 3,

		// Layering method
		layering: 0,

		// SVG rendering
		strokewidth: 1,
		linefilter: false,
		scale: 1,
		roundcoords: 1,
		viewbox: false,
		desc: false,
		lcpr: 0,
		qcpr: 0,

		// Blur
		blurradius: 0,
		blurdelta: 20,
	},
};

// creating options object, setting defaults for missing values
function checkoptions(options) {
	options = options || {};
	// Option preset (NOT SUPPORTED HERE)
	// if (typeof options === "string") {
	// 	options = options.toLowerCase();
	// 	if (OPTION_PRESETS[options]) {
	// 		options = OPTION_PRESETS[options];
	// 	} else {
	// 		options = {};
	// 	}
	// }
	// Defaults
	var ok = Object.keys(OPTION_PRESETS["default"]);
	for (var k = 0; k < ok.length; k++) {
		if (!options.hasOwnProperty(ok[k])) {
			options[ok[k]] = OPTION_PRESETS["default"][ok[k]];
		}
	}
	// options.pal is not defined here, the custom palette should be added externally: options.pal = [ { 'r':0, 'g':0, 'b':0, 'a':255 }, {...}, ... ];
	// options.layercontainerid is not defined here, can be added externally: options.layercontainerid = 'mydiv'; ... <div id="mydiv"></div>
	return options;
} // End of checkoptions()

/**
 * TODO: write description
 *
 * @param {*} tracedata
 * @param {*} rawOptions
 * @param {*} includeFunction
 * @returns
 */
export function pathDataStringsFromTraceData(
	tracedata,
	rawOptions,
	includeFunction
) {
	//
	const options = checkoptions(rawOptions);
	//
	const pathDataStrings = [];
	// Drawing: Layers and Paths loops
	for (var lcnt = 0; lcnt < tracedata.layers.length; lcnt++) {
		for (var pcnt = 0; pcnt < tracedata.layers[lcnt].length; pcnt++) {
			// Adding SVG <path> string
			const shouldInclude = includeFunction(tracedata, lcnt, pcnt);
			if (shouldInclude) {
				const pathData = pathDataFromTraceData(tracedata, lcnt, pcnt, options);
				pathDataStrings.push(pathData);
			}
		} // End of paths loop
	} // End of layers loop
	//
	//
	return pathDataStrings;
}

function roundtodec(val, places) {
	return +val.toFixed(places);
}

/**
 * fka getsvgstring upstream in the actual imagetracerjs repo
 * @param {*} tracedata
 * @param {*} lnum
 * @param {*} pathnum
 * @param {*} options
 * @returns
 */
function pathDataFromTraceData(tracedata, lnum, pathnum, options) {
	var layer = tracedata.layers[lnum];

	var smp = layer[pathnum];
	let pathDataString = "";
	var pcnt;

	// Line filter
	if (options.linefilter && smp.segments.length < 3) {
		return pathDataString;
	}

	// Creating non-hole path string
	if (options.roundcoords === -1) {
		pathDataString +=
			"M " +
			smp.segments[0].x1 * options.scale +
			" " +
			smp.segments[0].y1 * options.scale +
			" ";
		for (pcnt = 0; pcnt < smp.segments.length; pcnt++) {
			pathDataString +=
				smp.segments[pcnt].type +
				" " +
				smp.segments[pcnt].x2 * options.scale +
				" " +
				smp.segments[pcnt].y2 * options.scale +
				" ";
			if (smp.segments[pcnt].hasOwnProperty("x3")) {
				pathDataString +=
					smp.segments[pcnt].x3 * options.scale +
					" " +
					smp.segments[pcnt].y3 * options.scale +
					" ";
			}
		}
		pathDataString += "Z ";
	} else {
		pathDataString +=
			"M " +
			roundtodec(smp.segments[0].x1 * options.scale, options.roundcoords) +
			" " +
			roundtodec(smp.segments[0].y1 * options.scale, options.roundcoords) +
			" ";
		for (pcnt = 0; pcnt < smp.segments.length; pcnt++) {
			pathDataString +=
				smp.segments[pcnt].type +
				" " +
				roundtodec(smp.segments[pcnt].x2 * options.scale, options.roundcoords) +
				" " +
				roundtodec(smp.segments[pcnt].y2 * options.scale, options.roundcoords) +
				" ";
			if (smp.segments[pcnt].hasOwnProperty("x3")) {
				pathDataString +=
					roundtodec(
						smp.segments[pcnt].x3 * options.scale,
						options.roundcoords
					) +
					" " +
					roundtodec(
						smp.segments[pcnt].y3 * options.scale,
						options.roundcoords
					) +
					" ";
			}
		}
		pathDataString += "Z ";
	} // End of creating non-hole path string

	// Hole children
	for (var hcnt = 0; hcnt < smp.holechildren.length; hcnt++) {
		var hsmp = layer[smp.holechildren[hcnt]];
		// Creating hole path string
		if (options.roundcoords === -1) {
			if (hsmp.segments[hsmp.segments.length - 1].hasOwnProperty("x3")) {
				pathDataString +=
					"M " +
					hsmp.segments[hsmp.segments.length - 1].x3 * options.scale +
					" " +
					hsmp.segments[hsmp.segments.length - 1].y3 * options.scale +
					" ";
			} else {
				pathDataString +=
					"M " +
					hsmp.segments[hsmp.segments.length - 1].x2 * options.scale +
					" " +
					hsmp.segments[hsmp.segments.length - 1].y2 * options.scale +
					" ";
			}

			for (pcnt = hsmp.segments.length - 1; pcnt >= 0; pcnt--) {
				pathDataString += hsmp.segments[pcnt].type + " ";
				if (hsmp.segments[pcnt].hasOwnProperty("x3")) {
					pathDataString +=
						hsmp.segments[pcnt].x2 * options.scale +
						" " +
						hsmp.segments[pcnt].y2 * options.scale +
						" ";
				}

				pathDataString +=
					hsmp.segments[pcnt].x1 * options.scale +
					" " +
					hsmp.segments[pcnt].y1 * options.scale +
					" ";
			}
		} else {
			if (hsmp.segments[hsmp.segments.length - 1].hasOwnProperty("x3")) {
				pathDataString +=
					"M " +
					roundtodec(
						hsmp.segments[hsmp.segments.length - 1].x3 * options.scale
					) +
					" " +
					roundtodec(
						hsmp.segments[hsmp.segments.length - 1].y3 * options.scale
					) +
					" ";
			} else {
				pathDataString +=
					"M " +
					roundtodec(
						hsmp.segments[hsmp.segments.length - 1].x2 * options.scale
					) +
					" " +
					roundtodec(
						hsmp.segments[hsmp.segments.length - 1].y2 * options.scale
					) +
					" ";
			}

			for (pcnt = hsmp.segments.length - 1; pcnt >= 0; pcnt--) {
				pathDataString += hsmp.segments[pcnt].type + " ";
				if (hsmp.segments[pcnt].hasOwnProperty("x3")) {
					pathDataString +=
						roundtodec(hsmp.segments[pcnt].x2 * options.scale) +
						" " +
						roundtodec(hsmp.segments[pcnt].y2 * options.scale) +
						" ";
				}
				pathDataString +=
					roundtodec(hsmp.segments[pcnt].x1 * options.scale) +
					" " +
					roundtodec(hsmp.segments[pcnt].y1 * options.scale) +
					" ";
			}
		} // End of creating hole path string

		pathDataString += "Z "; // Close path
	} // End of holepath check

	return pathDataString.trim();
}
