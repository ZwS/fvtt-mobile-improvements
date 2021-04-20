export const preloadTemplates = async function () {
  const templatePaths = [
    "modules/mobile-improvements/templates/window-selector.hbs",
    "modules/mobile-improvements/templates/navigation.hbs",
    "modules/mobile-improvements/templates/menu.hbs",
  ];
  return loadTemplates(templatePaths);
};
