const MODULE_NAME = "mobile-improvements"; // TODO: Better handling

export enum settings {
  // In config
  SIDEBAR_PAUSES_RENDER = "sideBarPausesRender",
  // Not in config
  SHOW_PLAYER_LIST = "showPlayerList",
}

interface Callbacks {
  [setting: string]: (value) => void;
}

const noop = (): void => {
  return;
};

const moduleSettings = [
  {
    setting: settings.SIDEBAR_PAUSES_RENDER,
    name: "Pause rendering in sidebar",
    hint: "Pauses rendering of the map while the sidebar is active",
    type: Boolean,
    default: false,
  },
  {
    setting: settings.SHOW_PLAYER_LIST,
    type: Boolean,
    default: false,
    config: false,
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

export function getSetting(setting: settings): any {
  return game.settings.get(MODULE_NAME, setting as string);
}

export function setSetting(setting: settings, value): Promise<any> {
  return game.settings.set(MODULE_NAME, setting as string, value);
}
