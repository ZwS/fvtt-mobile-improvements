
import { preloadTemplates } from './module/preloadTemplates.js'
import { WindowSelector } from './module/window-selector.js'
import { RenderModes } from './module/render-modes.js'
import { TouchInput } from './module/touch-input.js'
import { registerSettings, settings } from './module/settings.js'
import * as mgr from './module/window-manager.js'

const MODULE_NAME = "mobile-improvements" // TODO: Better handling

Hooks.once('init', async function () {
	console.log('Mobile Improvements | Initializing Mobile Improvements')
	mgr.activate()
	if (ui.windowSelector === undefined) {
		ui.windowSelector = new WindowSelector()
	}
	if (ui.renderModes === undefined) {
		ui.renderModes = new RenderModes()
	}

	if (ui.touchInput === undefined) {
		ui.touchInput = new TouchInput()
	}
	registerSettings()
	await preloadTemplates()
})

Hooks.once('ready', function () {
	ui.windowSelector.render(true)

	if (game.settings.get(MODULE_NAME, settings.RENDERMODES)) {
		ui.renderModes.render(true)
	}
})

Hooks.on('canvasReady', function () {
	ui.touchInput.hook()
})