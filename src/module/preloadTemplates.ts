export const preloadTemplates = async function () {
  const templatePaths = [
    "modules/mobile-improvements/templates/window-selector.html",
    "modules/mobile-improvements/templates/navigation.html",
    "modules/mobile-improvements/templates/menu.html",
  ];
  return loadTemplates(templatePaths);
};
