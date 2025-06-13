const LOCAL_DATA = {
	startMouseX: 0,
	startMouseY: 0,
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
	console.log("Drag started at:", clientX, clientY);
	setLocalData({
		startMouseX: clientX,
		startMouseY: clientY,
	});
}

function onDrag(e, data, element) {
	const { clientX, clientY } = getClientCoordinates(e);
	const { top, left, bottom, right } = element.getBoundingClientRect();
	if (
		(right > window.outerWidth && clientX > LOCAL_DATA.startMouseX) ||
		(bottom > window.innerHeight && clientY > LOCAL_DATA.startMouseY) ||
		(left < 0 && clientX < LOCAL_DATA.startMouseX) ||
		(top < 0 && clientY < LOCAL_DATA.startMouseY)
	)
		return;
	const newX = data.x + clientX - LOCAL_DATA.startMouseX;
	const newY = data.y + clientY - LOCAL_DATA.startMouseY;
	console.log("Dragging to:", newX, newY);

	element.style.transform = `translate(${newX}px, ${newY}px)`;
	setLocalData({ startMouseX: clientX, startMouseY: clientY });
}

document.addEventListener("DOMContentLoaded", () => {
	const canMoveElems = document.querySelectorAll(".can-move");

	canMoveElems.forEach((element) => {
		let data = { x: 0, y: 0 };

		element.addEventListener("mousedown", (e) => {
			onDragStart(e);
			element.addEventListener("mousemove", (e) => {
				onDrag(e, data, element);
			});
		});

		element.addEventListener("mouseup", () => {
			element.removeEventListener("mousemove", onDrag);
		});

		element.addEventListener("touchstart", (e) => {
			onDragStart(e);
			element.addEventListener("touchmove", (e) => {
				onDrag(e, data, element);
			});
		});

		element.addEventListener("touchend", () => {
			element.removeEventListener("touchmove", onDrag);
		});
	});
});
