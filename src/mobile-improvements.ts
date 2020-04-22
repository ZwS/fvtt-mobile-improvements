
import { preloadTemplates } from './preloadTemplates.js'
import { WindowSelector } from './window-selector.js'
import { DisplayModes } from './display-modes.js'
import { TouchInput } from './touch-input.js'
import { registerSettings, settings } from './settings.js'
const MODULE_NAME = "mobile-improvements" // TODO: Better handling

Hooks.once('init', async function () {
	console.log('Mobile Improvements | Initializing Mobile Improvements')
	if (ui.windowSelector === undefined) {
		ui.windowSelector = new WindowSelector()
	}
	if (ui.displayModes === undefined) {
		ui.displayModes = new DisplayModes()
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
		ui.displayModes.render(true)
	}
})

Hooks.on('canvasReady', function () {
	ui.touchInput.hook()
})