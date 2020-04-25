// WindowManager is a singleton that allows management of application windows
export function activate(): any {
    if (!ui.WindowManager) {
        ui.WindowManager = new WindowManager()
    }
}

export function getManager() {
    if (!ui.WindowManager) {
        activate()
    }
    return ui.WindowManager
}

export class Window {
    readonly app: Application
    constructor(app: Application) {
        this.app = app
    }

    get title(): string { return this.app.title }
    get id(): number { return this.app.appId }

    private _floatToTop(element: HTMLElement) {
        let z = Number(window.document.defaultView.getComputedStyle(element).zIndex);
        if (z <= _maxZ) {
            element.style.zIndex = Math.min(++_maxZ, 9999).toString()
        }
    }
    show() {
        // @ts-ignore
        if (this.app._minimized) {
            // @ts-ignore
            this.app.maximize()
        } else {
            this._floatToTop((<JQuery>this.app.element).get(0))
        }
    }
    minimize() {
        this.app.minimize()
    }
    close() {
        this.app.close()
    }
}

export class WindowManager {
    windows: {
        [id: string]: Window
    } = {}
    version = "1.0"
    windowChangeHandler: ProxyHandler<Object> = {
        set: (target, property, value, receiver) => {
            target[property] = value
            this.windowAdded(property)
            // Wait until window is rendered
            Hooks.once("render" + value.constructor.name, this.newWindowRendered)
            return true
        },
        deleteProperty: (target, property) => {
            setTimeout(() => { this.windowRemoved(property) }, 1)
            return delete target[property]
        },
    }
    constructor() {
        ui.windows = new Proxy(ui.windows, this.windowChangeHandler)
        console.info("Window Manager | Initiated")
        Hooks.call("WindowManager:Init")
    }

    newWindowRendered = (window, html, data) => {
        Hooks.call("WindowManager:NewRendered", window.appId)
    }
    windowAdded(appId) {
        this.windows[appId] = new Window(ui.windows[appId])
        Hooks.call("WindowManager:Added", appId)
    }
    windowRemoved(appId) {
        delete this.windows[appId]
        Hooks.call("WindowManager:Removed", appId)
    }
}