export function onImageSelection(inputElem, imgElemId, callback = () => null) {
	if (inputElem.files && inputElem.files[0]) {
		var reader = new FileReader();
		reader.onload = function (e) {
			const imgElem = document.getElementById(imgElemId);
			imgElem.setAttribute("src", e.target.result);
			callback();
		};
		reader.readAsDataURL(inputElem.files[0]);
	}
}
