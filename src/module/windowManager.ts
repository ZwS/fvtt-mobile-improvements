// WindowManager is a singleton that allows management of application windows
export function activate(): any {
  if (!window.WindowManager) {
    window.WindowManager = new WindowManager();
  }
}

export function getManager() {
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

  show() {
    // @ts-ignore
    if (this.app._minimized) {
      this.app.maximize();
    }
    if (this.app.bringToTop) return this.app.bringToTop();

    const element = this.app.element.get(0);
    let z = parseInt(
      window.document.defaultView.getComputedStyle(element).zIndex
    );
    if (z < _maxZ) {
      element.style.zIndex = Math.min(++_maxZ, 9999).toString();
    }
  }
  minimize() {
    this.app.minimize();
  }
  close() {
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
  windowChangeHandler: ProxyHandler<Object> = {
    set: (target, property: string, value, receiver) => {
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
    //@ts-ignore
    ui.windows = new Proxy(ui.windows, this.windowChangeHandler);
    // Override Application bringToTop
    if (Application.prototype.bringToTop) {
      const old = Application.prototype.bringToTop;
      const self = this;
      Application.prototype.bringToTop = function () {
        old.call(this);
        self.windowBroughtToTop(this.appId);
      };
    }
    console.info("Window Manager | Initiated");
    Hooks.call("WindowManager:Init");
  }

  newWindowRendered = (window, html, data) => {
    Hooks.call("WindowManager:NewRendered", window.appId);
  };
  windowAdded(appId) {
    this.windows[appId] = new Window(ui.windows[appId]);
    Hooks.call("WindowManager:Added", appId);
  }
  windowRemoved(appId) {
    delete this.windows[appId];
    Hooks.call("WindowManager:Removed", appId);
  }
  windowBroughtToTop(appId) {
    Hooks.call("WindowManager:BroughtToTop", appId);
  }

  minimizeAll() {
    let didMinimize = false;
    Object.entries(this.windows).forEach(([id, window]) => {
      didMinimize = didMinimize || !window.minimized;
      window.minimize();
    });
    return didMinimize;
  }

  closeAll() {
    const closed = Object.keys(this.windows).length != 0;
    Object.entries(this.windows).forEach(([id, window]) => {
      window.close();
    });
    return closed;
  }
}
