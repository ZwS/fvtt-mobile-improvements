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
    // @ts-ignore
    if (this.app._minimized) {
      this.app.maximize();
    }
    if (this.app.bringToTop) return this.app.bringToTop();

    const element = this.app.element.get(0);
    const z = parseInt(
      window.document.defaultView.getComputedStyle(element).zIndex
    );
    if (z < _maxZ) {
      element.style.zIndex = Math.min(++_maxZ, 9999).toString();
    }
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
  windows: {
    [id: string]: Window;
  } = {};
  // Stack order of windows
  stack: number[];
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
    if (Application.prototype.bringToTop) {
      const old = Application.prototype.bringToTop;
      const windowBroughtToTop = this.windowBroughtToTop.bind(this);
      Application.prototype.bringToTop = function () {
        old.call(this);
        windowBroughtToTop(this.appId);
      };
    }
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
    let didMinimize = false;
    Object.values(this.windows).forEach((window) => {
      didMinimize = didMinimize || !window.minimized;
      window.minimize();
    });
    return didMinimize;
  }

  closeAll(): boolean {
    const closed = Object.keys(this.windows).length != 0;
    Object.values(this.windows).forEach((window) => {
      window.close();
    });
    return closed;
  }
}
