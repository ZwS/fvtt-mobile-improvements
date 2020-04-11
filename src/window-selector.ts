const icons = {
	"": "",
	"combat": "fa-fist-raised",
	"scenes": "fa-map",
	"actors": "fa-users",
	"items": "fa-suitcase",
	"journal": "fa-book-open",
	"tables": "fa-th-list",
	"playlists": "fa-music",
	"compendium": "fa-atlas",
	"settings": "fa-cogs",
	"npc": "fa-skull",
	"character": "fa-user",
	"spell": "fa-magic",
	"equipment": "fa-tshirt",
	"feat": "fa-hand-rock",
	"class": "fa-user",
}

export class WindowSelector extends Application {
	windowChangeHandler = {
		app: null,
		set: function (target, property, value, receiver) {
			target[property] = value
			setTimeout(() => { this.app.update() }, 10)
			return true
		},
		deleteProperty: function (target, property) {
			setTimeout(() => { this.app.update() }, 10)
			return delete target[property]
		},
	}
	toggleButton: JQuery = null
	constructor() {
		super({
			template: "modules/mobile-improvements/templates/window-selector.html",
			popOut: false,
		})
		this.windowChangeHandler.app = this
		ui.windows = new Proxy(ui.windows, this.windowChangeHandler)
	}
	protected activateListeners(html: JQuery | HTMLElement): void {
		this.toggleButton = (<JQuery>this.element).find(".window-count")
		this.toggleButton.click(ev => {
			ev.preventDefault();
			(<JQuery>this.element).toggleClass("open")
		})
	}
	floatToTop(element) {
		let z = Number(window.document.defaultView.getComputedStyle(element).zIndex);
		// @ts-ignore
		if (z <= _maxZ) {
			// @ts-ignore
			element.style.zIndex = Math.min(++_maxZ, 9999);
		}
	}
	toggleOpen() {
		(<JQuery>this.element).toggleClass("open")
	}
	// Attempt to discern the title and icon of the window
	windowInfo(win: any) {
		let title = win.title
		const windowType = win.icon || win.tabName
			|| win?.object?.data?.type
			|| (win.metadata ? "compendium" : "")
			|| ""
		console.log(windowType)
		const icon = icons[windowType] || windowType
		return { title, icon }
	}

	update() {
		const count = Object.values(ui.windows).length
		if (count == 0) {
			(<JQuery>this.element).removeClass("has-items");
			(<JQuery>this.element).removeClass("open");
			return
		} else {
			(<JQuery>this.element).addClass("has-items")
		}
		// TODO: add/remove changed instead of clear/fill
		let list = (<JQuery>this.element).find(".window-list")
		list.empty()
		this.toggleButton.html(count.toString())
		Object.values(ui.windows).forEach((win: Application) => {
			const winInfo = this.windowInfo(win)
			const windowButton = $(`<button class="window-select" title="${winInfo.title}"><i class="fas ${winInfo.icon}"></i> ${winInfo.title}</button>`)
			const closeButton = $(`<button class="window-close" title="close"><i class="fas fa-times"></i></button>`)
			const row = $('<li class="window-row"></li>')
			row.append(windowButton, closeButton)
			list.append(row)
			windowButton.click(ev => {
				ev.preventDefault()
				this.toggleOpen()
				// @ts-ignore
				if (win._minimized) {
					// @ts-ignore
					win.maximize()
				} else {
					this.floatToTop((<JQuery>win.element).get(0))
				}
			})
			closeButton.click(ev => {
				ev.preventDefault()
				win.close()
			})
		})
	}
}
