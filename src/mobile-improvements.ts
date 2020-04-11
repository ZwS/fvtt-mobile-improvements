
import { preloadTemplates } from './preloadTemplates.js'
import { WindowSelector } from './window-selector.js'
import { DisplayModes } from './display-modes.js'
import { TouchInput } from './touch-input.js'

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
	await preloadTemplates()
})

Hooks.once('ready', function () {
	ui.windowSelector.render(true)
	ui.displayModes.render(true)
})

Hooks.once('canvasReady', function () {
	ui.touchInput.init()
})