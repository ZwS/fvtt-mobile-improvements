
import { preloadTemplates } from './preloadTemplates.js'
import { WindowSelector } from './window-selector.js'

Hooks.once('init', async function () {
	console.log('Mobile Improvements | Initializing Other Screens')
	if (ui.windowSelector === undefined) {
		ui.windowSelector = new WindowSelector()
	}
	await preloadTemplates()
})

Hooks.once('ready', function () {
	ui.windowSelector.render(true)
})

