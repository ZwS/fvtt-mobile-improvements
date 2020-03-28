
// Import TypeScript modules
import { preloadTemplates } from './preloadTemplates.js'
import { WindowSelector } from './window-selector.js'


/* ------------------------------------ */
/* Initialize module					*/
/* ------------------------------------ */
Hooks.once('init', async function () {
	console.log('other-screens | Initializing Other Screens')

	// Assign custom classes and constants here
	if (ui.windowSelector === undefined) {
		ui.windowSelector = new WindowSelector()
	}

	// Preload Handlebars templates
	await preloadTemplates()
})




/* ------------------------------------ */
/* Setup module							*/
/* ------------------------------------ */
Hooks.once('setup', function () {
	// Do anything after initialization but before
	// ready
})

/* ------------------------------------ */
/* When ready							*/
/* ------------------------------------ */
Hooks.once('ready', function () {
	// Do anything once the module is ready
	ui.windowSelector.render(true)
})

// Add any additional hooks if necessary
