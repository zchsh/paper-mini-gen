function createSvgElem(nodeType, values) {
	const node = document.createElementNS("http://www.w3.org/2000/svg", nodeType);
	for (const key in values) {
		const namespace =
			key === "xlink:href" ? "http://www.w3.org/1999/xlink" : null;
		if (namespace !== null) {
			node.setAttributeNS(namespace, key, values[key]);
		} else {
			node.setAttribute(key, values[key]);
		}
	}
	return node;
}
