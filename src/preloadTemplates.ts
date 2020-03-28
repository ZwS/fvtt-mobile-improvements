export const preloadTemplates = async function () {
	const templatePaths = [
		"modules/other-screens/templates/window-selector.html"
	];
	return loadTemplates(templatePaths);
}
