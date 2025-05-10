function buildSvgRootNode(viewBox) {
	const [minX, minY, svgWidth, svgHeight] = viewBox;
	const svgNode = createSvgElem("svg", {
		width: svgWidth,
		height: svgHeight,
		viewBox: `${minX} ${minY} ${svgWidth} ${svgHeight}`,
	});
	return svgNode;
}
