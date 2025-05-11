function onImageSelection(inputElem, imgElemId) {
	if (inputElem.files && inputElem.files[0]) {
		var reader = new FileReader();
		reader.onload = function (e) {
			document.getElementById(imgElemId).setAttribute("src", e.target.result);
		};
		reader.readAsDataURL(inputElem.files[0]);
	}
}
