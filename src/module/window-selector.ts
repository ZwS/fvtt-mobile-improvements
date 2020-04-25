import { Window } from 'window-manager'

const icons = {
	"": "",
	"combat": "fa-fist-raised",
	"scenes": "fa-map",
	"scene": "fa-map",
	"actors": "fa-users",
	"actor": "fa-users",
	"items": "fa-suitcase",
	"item": "fa-suitcase",
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
	toggleButton: JQuery = null
	list: JQuery = null

	constructor() {
		super({
			template: "modules/mobile-improvements/templates/window-selector.html",
			popOut: false,
		})
		Hooks.on("WindowManager:NewRendered", this.windowAdded.bind(this))
		Hooks.on("WindowManager:Removed", this.windowRemoved.bind(this))
	}

	protected activateListeners(html: JQuery | HTMLElement): void {
		this.toggleButton = (<JQuery>this.element).find(".window-count")
		this.toggleButton.click(ev => {
			ev.preventDefault()
			this.toggleOpen()
		})
		this.list = (<JQuery>this.element).find(".window-list")
	}
	toggleOpen() {
		(<JQuery>this.element).toggleClass("open")
	}
	// Attempt to discern the title and icon of the window
	winIcon(win: any) {
		let windowType: string = win.icon || win.tabName
			|| win?.object?.data?.type || win?.object?.data?.entity
			|| (win.metadata ? "compendium" : "")
			|| ""
		windowType = windowType.toLowerCase()
		const icon = icons[windowType] || windowType
		return icon
	}

	newWindow = (win: Window) => {
		const winIcon = this.winIcon(win.app)
		const windowButton = $(`<button class="window-select" title="${win.title}"><i class="fas ${winIcon}"></i> ${win.title}</button>`)
		const closeButton = $(`<button class="window-close" title="close"><i class="fas fa-times"></i></button>`)
		const row = $(`<li class="window-row"  data-id="${win.id}"></li>`)
		row.append(windowButton, closeButton)

		windowButton.click(ev => {
			ev.preventDefault()
			win.show()
			this.toggleOpen()
		})
		closeButton.click(ev => {
			ev.preventDefault()
			win.close()
		})
		return row
	}
	windowAdded(appId) {
		this.list.append(this.newWindow(ui.WindowManager.windows[appId]))
		this.update()
	}
	windowRemoved(appId) {
		this.list.find(`li[data-id="${appId}"]`).remove()
		this.update()
	}

	update() {
		const winCount = Object.values(ui.WindowManager.windows).length;
		if (winCount == 0) {
			(<JQuery>this.element).removeClass("has-items");
			(<JQuery>this.element).removeClass("open");
			return
		} else {
			(<JQuery>this.element).addClass("has-items")
		}
		this.toggleButton.html(winCount.toString())
	}
}
