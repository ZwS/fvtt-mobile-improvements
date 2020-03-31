export const preloadTemplates = async function () {
	const templatePaths = [
		"modules/mobile-improvements/templates/window-selector.html"
	];
	return loadTemplates(templatePaths);
}
