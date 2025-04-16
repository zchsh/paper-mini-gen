function flattenSvgToPaths(svgElem) {
	const paths = flattenSVG(svgElem);
	/**
	 * Iterate over the returned paths,
	 * to produce an array of polygons.
	 * Each polygon may have many regions (eg shapes with cutouts).
	 *
	 * Regions may mean filled or un-filled areas, something to do with
	 * winding order, I don't fully get it but so far it works...
	 */
	const polygons = [];
	let regions = [];
	let currentGroupId = null;
	for (const path of paths) {
		/**
		 * TODO: is groupId still needed here?
		 * Have not implemented any kind of group assignment...
		 * But somehow things still seem to work?
		 */
		const { groupId, points } = path;
		const isFirstIteration = currentGroupId === null;
		const hasGroupId = typeof groupId === "string";
		const hasGroupIdMatch = hasGroupId && groupId === currentGroupId;
		if (isFirstIteration || hasGroupIdMatch) {
			regions.push(points);
		} else {
			// Push the existing regions to a polygon
			polygons.push({ regions });
			// Reset regions, we're starting a new polygon
			regions = [];
			// Push the points from this path as a region in the new polygon
			regions.push(points);
		}
		// Update the groupId
		currentGroupId = groupId;
	}
	// Push the in-progress region (not yet pushed, cause there was no
	// different groupID to follow it and cause it to be pushed)
	polygons.push({ regions });
	return polygons;
}
