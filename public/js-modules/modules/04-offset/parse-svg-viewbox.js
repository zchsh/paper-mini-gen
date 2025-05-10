export function parseSvgViewbox(svgElem) {
	let viewBoxString = svgElem.getAttribute("viewBox");
	if (!viewBoxString) {
		const svgWidth = svgElem.getAttribute("width");
		const svgHeight = svgElem.getAttribute("height");
		viewBoxString = `0 0 ${svgWidth} ${svgHeight}`;
	}
	const viewBox = viewBoxString.split(" ").map((s) => parseFloat(s));
	return viewBox;
}
