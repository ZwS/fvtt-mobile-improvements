export const preloadTemplates = async function () {
	const templatePaths = [
		"modules/mobile-improvements/templates/window-selector.html",
		"modules/mobile-improvements/templates/display-modes.html",
	];
	return loadTemplates(templatePaths);
}
