async function copyTextToClipboard(text) {
	const blobText = new Blob([text], { type: "text/plain" });
	const data = [
		new ClipboardItem({
			["text/plain"]: blobText,
		}),
	];
	navigator.clipboard.write(data).then(
		() => {},
		() => {
			alert("Copy to clipboard failed for some reason.");
		}
	);
}
