/**
 * Converts Paths to SVG path string
 * and scales down the coordinates
 *
 * TODO: probably remove the scale part of things?
 * Or maybe I should be scaling up and down during the tracing process?
 *
 * paths: [[{X: 0, Y: 0}, {X: 1, Y: 1}]]
 */
function renderPathsString(paths) {
	var svgpath = "",
		i,
		j;
	for (i = 0; i < paths.length; i++) {
		for (j = 0; j < paths[i].length; j++) {
			if (j === 0) {
				svgpath += "M";
			} else {
				svgpath += "L";
			}
			const [x, y] = paths[i][j];
			svgpath += x + ", " + y;
		}
		svgpath += "Z";
	}
	if (svgpath == "") svgpath = "M0,0";
	return svgpath;
}
