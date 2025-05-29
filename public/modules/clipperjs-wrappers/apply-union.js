/**
 * Given an array of polygon objects, this function applies a boolean union
 * operation to combine the polygons into a single polygon object, and
 * Returns that single polygon object.
 *
 * TODO: could probably swap in ClipperJS here?
 *
 * @param {{ regions: [number, number][][] }[]} polygons - An array of polygon
 * objects to join in a boolean union operation.
 * @return {{ regions: [number, number][][] }} - An array containing a
 * single polygon object that represents the union of the input polygons.
 */
export function applyUnion(polygons) {
	// Set up the clipper
	const c = new ClipperLib.Clipper();
	// Destructure the polygons into a first polygon and the rest
	const [firstPolygon, ...restPolygons] = polygons;
	// Set up the subject path, using the first polygon
	const preScale = 10;
	const clipperScale = 100;
	const subjClip = clipperPathsFromPolygon(firstPolygon, preScale);
	ClipperLib.JS.ScaleUpPaths(subjClip, clipperScale);
	c.AddPaths(subjClip, ClipperLib.PolyType.ptSubject, true);
	// Set up the clip paths, using the remaining polygons
	for (const polygon of restPolygons) {
		const objClip = clipperPathsFromPolygon(polygon, preScale);
		ClipperLib.JS.ScaleUpPaths(objClip, clipperScale);
		// Add the paths to the clipper
		c.AddPaths(objClip, ClipperLib.PolyType.ptClip, true);
	}
	// Execute the union operation
	let solutionClip = new ClipperLib.Paths();
	c.Execute(ClipperLib.ClipType.ctUnion, solutionClip);
	// Scale down the solution paths
	ClipperLib.JS.ScaleDownPaths(solutionClip, clipperScale * preScale);
	// Convert the solution paths to a format we can use
	const solutionRegions = solutionClip.map((regionClipper) => {
		return regionClipper.map(({ X, Y }) => [X, Y]);
	});

	// Return the union as a polygon object
	const unionPolygonObj = {
		regions: solutionRegions,
	};
	return unionPolygonObj;
}

/**
 *
 * @param {*} polygon
 * @param {*} preScale
 * @returns
 */
function clipperPathsFromPolygon(polygon, preScale) {
	const regionsPreScaled = polygon.regions.map((region) => {
		return region.map(([X, Y]) => ({
			X: Math.round(X * preScale),
			Y: Math.round(Y * preScale),
		}));
	});
	// Set up the subject paths
	const subjectClipper = new ClipperLib.Paths();
	for (const regionPreScaled of regionsPreScaled) {
		subjectClipper.push(regionPreScaled);
	}
	return subjectClipper;
}
