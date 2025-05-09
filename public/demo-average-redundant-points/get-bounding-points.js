function getBoundingPoints(allPoints) {
	const { minX, minY, maxX, maxY } = allPoints.reduce(
		(acc, point) => {
			const [x, y] = point;
			return {
				minX: acc.minX === null ? x : Math.min(acc.minX, x),
				minY: acc.minY === null ? y : Math.min(acc.minY, y),
				maxX: acc.maxX === null ? x : Math.max(acc.maxX, x),
				maxY: acc.maxY === null ? y : Math.max(acc.maxY, y),
			};
		},
		{ minX: null, minY: null, maxX: null, maxY: null }
	);
	return { minX, minY, maxX, maxY };
}
