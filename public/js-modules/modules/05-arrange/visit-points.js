export function visitPoints(polygons, visitFunction) {
	return polygons.map((p) => visitPointsPolygon(p, visitFunction));
}

function visitPointsPolygon(polygon, visitFunction) {
	return {
		...polygon,
		regions: polygon.regions.map((region) => {
			return visitPointsArray(region, visitFunction);
		}),
	};
}

function visitPointsArray(pointsArray, visitFunction) {
	return pointsArray.map((p) => visitFunction(p));
}
