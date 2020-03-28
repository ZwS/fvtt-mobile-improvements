# Other Screens - Flexible view for Foundry VTT
This module is intended to make the UI more flexible for use with unorthodox screen resolutions and aspects. Primary focus is on mobile and tablet use. Secondary focus is on TV/Display/Table view.

Current state: Useful for general UI interaction. Map does not work well with touch input.

# Features
- Full-view application windows
- Full-view sidebar
- Window switching
  - List and switch between open windows
  - Minimizing windows hides them
- Flexible-ish macro bar
## dnd5e
- Narrower character sheets

# TODO
- Application window view
  - Full-view windows (ongoing)
    - Better dialogs
  - Some kind of toggle between window/map views

- Map interaction
  - Panning
    - At least try to get some touch input working for panning around the map
  - Selection
  - Movement
  - Manual map controls
    - Alternative to getting fully working touch control - add pan-and-zoom controls

- System-specific
  - Responsive sheets
    - dnd5e
    - Write an issue or pull request for other systems!

- Others
  - Combat tracking improvements?
  - Build system improvements


# Build
Based on [create-foundry-project](https://gitlab.com/foundry-projects/foundry-pc/create-foundry-project).
```bash
npm install
npm run build:watch
```

## Automatic install
Make a symlink to install the result into your foundry data; create a `foundryconfig.json` file with your Foundry Data path.
```json
{
  "dataPath": "~/.local/share/FoundryVTT/",
}
```

`build` will build and set up a symlink between `dist` and your `dataPath`.
```bash
npm run build
```

## Differences to create-foundry-project
- No source files in dist folder (safe to delete)
- watch/copy files improved
