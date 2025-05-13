import { createSvgElem } from "./create-svg-elem.js";

export function buildCircleNodesFromPoints(points) {
	const circleNodes = points.map((point) => {
		const [cx, cy] = point;
		const circleNode = createSvgElem("circle", {
			cx,
			cy,
			r: 1,
			fill: "magenta",
		});
		return circleNode;
	});
	return circleNodes;
}
