const MODULE_NAME = "mobile-improvements"; // TODO: Better handling

export const settings = {
  RENDERMODES: "renderModes",
};

export function registerSettings() {
  game.settings.register(MODULE_NAME, settings.RENDERMODES, {
    name: "Render mode toggle",
    hint:
      "Adds a button below the sidebar to turn off scene rendering (reload required)",
    type: Boolean,
    default: false,
    scope: "client",
    config: true,
  });
}
