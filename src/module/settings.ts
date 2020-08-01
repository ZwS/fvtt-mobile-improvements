const MODULE_NAME = "mobile-improvements"; // TODO: Better handling

export enum settings {
  RENDERMODES = "renderModes",
}

interface Callbacks {
  [setting: string]: (value) => void;
}

const noop = (): void => {
  return;
};

const moduleSettings = [
  {
    setting: settings.RENDERMODES,
    name: "Render mode toggle",
    hint:
      "Adds a button below the sidebar to turn off scene rendering (reload required)",
    type: Boolean,
    default: false,
  },
];

function registerSetting(callbacks: Callbacks, { setting, ...options }): void {
  game.settings.register(MODULE_NAME, setting, {
    config: true,
    scope: "client",
    ...options,
    onChange: callbacks[setting] || noop,
  });
}

export function registerSettings(callbacks: Callbacks = {}): void {
  moduleSettings.forEach(item => {
    registerSetting(callbacks, item);
  });
}

export function getSetting(setting: settings): string | boolean | number {
  return game.settings.get(MODULE_NAME, setting as string);
}

export function setSetting(setting: settings, value): Promise<any> {
  return game.settings.set(MODULE_NAME, setting as string, value);
}
