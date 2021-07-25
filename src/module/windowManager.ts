// WindowManager is a singleton that allows management of application windows
export function activate(): void {
  if (!window.WindowManager) {
    window.WindowManager = new WindowManager();
  }
}

export function getManager(): WindowManager {
  if (!window.WindowManager) {
    activate();
  }
  return window.WindowManager;
}

export class Window {
  readonly app: Application;
  constructor(app: Application) {
    this.app = app;
  }

  get title(): string {
    return this.app.title;
  }
  get id(): number {
    return this.app.appId;
  }

  get minimized(): boolean {
    // @ts-ignore
    return this.app._minimized;
  }

  show(): void {
    if (this.minimized) {
      this.app.maximize();
    }
    this.app.bringToTop();
  }
  minimize(): void {
    this.app.minimize();
  }
  close(): void {
    this.app.close();
  }
}

export class WindowManager {
  // All windows
  windows: { [id: string]: Window } = {};
  version = "1.0";
  windowChangeHandler: ProxyHandler<any> = {
    set: (target, property: string, value) => {
      target[property] = value;
      this.windowAdded(parseInt(property as string));
      // Hook for new window being rendered
      Hooks.once("render" + value.constructor.name, this.newWindowRendered);
      return true;
    },
    deleteProperty: (target, property) => {
      const res = delete target[property];
      setTimeout(() => {
        this.windowRemoved(parseInt(property as string));
      }, 1);
      return res;
    },
  };
  constructor() {
    ui.windows = new Proxy(ui.windows, this.windowChangeHandler);
    // Override Application bringToTop
    const old = Application.prototype.bringToTop;
    const windowBroughtToTop = this.windowBroughtToTop.bind(this);
    Application.prototype.bringToTop = function () {
      old.call(this);
      windowBroughtToTop(this.appId);
    };

    console.info("Window Manager | Initiated");
    Hooks.call("WindowManager:Init");
  }

  newWindowRendered(app: Application): void {
    Hooks.call("WindowManager:NewRendered", app.appId);
  }
  windowAdded(appId: number): void {
    this.windows[appId] = new Window(ui.windows[appId]);
    Hooks.call("WindowManager:Added", appId);
  }
  windowRemoved(appId: number): void {
    delete this.windows[appId];
    Hooks.call("WindowManager:Removed", appId);
  }
  windowBroughtToTop(appId: number): void {
    Hooks.call("WindowManager:BroughtToTop", appId);
  }

  minimizeAll(): boolean {
    return Object.values(this.windows).reduce((didMinimize, window) => {
      didMinimize = didMinimize || !window.minimized;
      window.minimize();
      return didMinimize;
    }, false as boolean);
  }

  closeAll(): boolean {
    const closed = Object.keys(this.windows).length != 0;
    Object.values(this.windows).forEach((window) => {
      window.close();
    });
    return closed;
  }
}
