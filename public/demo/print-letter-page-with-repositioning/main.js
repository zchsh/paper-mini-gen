const LOCAL_DATA = {
	startMouseX: 0,
	startMouseY: 0,
	element: null,
};

function setLocalData(data) {
	Object.assign(LOCAL_DATA, data);
}

function getClientCoordinates(e) {
	if (e instanceof MouseEvent) {
		return { clientX: e.clientX, clientY: e.clientY };
	} else if (e instanceof TouchEvent) {
		const touch = e.touches[0] || e.changedTouches[0];
		return { clientX: touch.clientX, clientY: touch.clientY };
	} else {
		throw new Error("Unsupported event type");
	}
}

function onDragStart(e) {
	const { clientX, clientY } = getClientCoordinates(e);
	const element = e.target.closest(".can-move");
	setLocalData({
		startMouseX: clientX,
		startMouseY: clientY,
		element,
	});
}

function onDrag(e) {
	const element = LOCAL_DATA.element;
	if (!element || !element.classList.contains("can-move")) {
		return;
	}
	const { clientX, clientY } = getClientCoordinates(e);
	const { top, left, bottom, right } = element.getBoundingClientRect();
	const willBeOutOfBounds =
		(right > window.outerWidth && clientX > LOCAL_DATA.startMouseX) ||
		(bottom > window.innerHeight && clientY > LOCAL_DATA.startMouseY) ||
		(left < 0 && clientX < LOCAL_DATA.startMouseX) ||
		(top < 0 && clientY < LOCAL_DATA.startMouseY);
	if (willBeOutOfBounds) {
		return;
	}
	// Get the current position of the element, based on the transform property
	const transform = element.style.transform || "translate(0px, 0px)";
	const match = transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
	let data = { x: 0, y: 0 };
	if (match) {
		data.x = parseFloat(match[1]);
		data.y = parseFloat(match[2]);
	}
	// Calculate the new position based on the mouse movement
	const newX = data.x + clientX - LOCAL_DATA.startMouseX;
	const newY = data.y + clientY - LOCAL_DATA.startMouseY;
	element.style.transform = `translate(${newX}px, ${newY}px)`;
	setLocalData({ startMouseX: clientX, startMouseY: clientY });
}

document.addEventListener("DOMContentLoaded", () => {
	const canMoveElems = document.querySelectorAll(".can-move");
	for (const element of canMoveElems) {
		element.addEventListener("dragstart", (e) => {
			e.preventDefault(); // Prevent default drag behavior
		});

		element.addEventListener("mousedown", (e) => {
			onDragStart(e);
			document.addEventListener("mousemove", onDrag);
		});

		element.addEventListener("mouseup", () => {
			document.removeEventListener("mousemove", onDrag);
		});
	}
});
