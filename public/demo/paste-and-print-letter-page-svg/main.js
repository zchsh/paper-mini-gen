/**
 * DRAG AND DROP REPOSITIONING for class "can-move" elements
 */

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

function preventDefault(e) {
	e.preventDefault();
}

function initCanMoveElement(element) {
	element.addEventListener("dragstart", preventDefault);

	element.addEventListener("mousedown", (e) => {
		onDragStart(e);
		document.addEventListener("mousemove", onDrag);
	});

	element.addEventListener("mouseup", () => {
		document.removeEventListener("mousemove", onDrag);
	});
}

/**
 * PASTE
 */

function handlePasteEvent(clipboardText) {
	const pasteTarget = document.getElementById("paste-target");
	if (!pasteTarget) {
		console.warn("Paste target element not found");
		return;
	}
	//
	const newElement = document.createElement("div");
	newElement.className = "can-move";
	newElement.innerHTML = clipboardText;
	pasteTarget.appendChild(newElement);
	// Add drag event listeners to the new element
	initCanMoveElement(newElement);
}

function getClipboardText() {
	if (navigator.clipboard && navigator.clipboard.readText) {
		return navigator.clipboard.readText();
	} else {
		return null;
	}
}

function listenForPaste() {
	document.addEventListener("paste", (e) => {
		e.preventDefault(); // Prevent default paste behavior
		const clipboardText = e.clipboardData.getData("text/plain");
		handlePasteEvent(clipboardText);
	});

	document
		.getElementById("paste-button")
		.addEventListener("click", async () => {
			const clipboardText = await getClipboardText();
			if (clipboardText !== null) {
				handlePasteEvent(clipboardText);
			}
		});
}
/**
 * ONLOAD INITIALIZATION
 */
document.addEventListener("DOMContentLoaded", () => {
	// Listen for drag events on elements with class "can-move"
	const canMoveElems = document.querySelectorAll(".can-move");
	for (const element of canMoveElems) {
		initCanMoveElement(element);
	}
	// Listen for paste events
	listenForPaste();
});
