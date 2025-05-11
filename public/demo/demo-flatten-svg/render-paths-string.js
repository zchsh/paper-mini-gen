// Converts Paths to SVG path string
// and scales down the coordinates
function renderPathsString(paths, scale) {
	var svgpath = "",
		i,
		j;
	if (!scale) scale = 1;
	for (i = 0; i < paths.length; i++) {
		for (j = 0; j < paths[i].length; j++) {
			if (j === 0) {
				svgpath += "M";
			} else {
				svgpath += "L";
			}
			svgpath += paths[i][j].X / scale + ", " + paths[i][j].Y / scale;
		}
		svgpath += "Z";
	}
	if (svgpath == "") svgpath = "M0,0";
	return svgpath;
}
