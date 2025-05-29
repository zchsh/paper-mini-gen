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
	/**
	 * Union operation pulled from this PolyBool.js example:
	 * https://github.com/velipso/polybooljs?tab=readme-ov-file#advanced-example-1
	 */
	var segments = PolyBool.segments(polygons[0]);
	for (var i = 1; i < polygons.length; i++) {
		var seg2 = PolyBool.segments(polygons[i]);
		var comb = PolyBool.combine(segments, seg2);
		segments = PolyBool.selectUnion(comb);
	}
	const unionPolygonObj = PolyBool.polygon(segments);
	// Return as an array
	return unionPolygonObj;
}
