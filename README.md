# Mobile Improvements - Flexible view for Foundry VTT
This module is intended to make the UI more flexible for use with mobiles, tablets and other low-resolution devices.

Current state: Useful for general UI interaction. Map does not work with touch input.

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
    - Alternative to getting working touch control - add pan-and-zoom controls

- System-specific
  - Responsive sheets
    - dnd5e
    - Write an issue or pull request for other systems!

- Others
  - Combat tracking improvements?
  - Build system improvements


# Build
Based on [create-foundry-project](https://gitlab.com/foundry-projects/foundry-pc/create-foundry-project). The main difference is that generated code is never mixed with source. The dist folder is separate and contains the fully built module after build.
```bash
npm install
npm run build:watch
```

## npm build scripts

### build
`build` will build the code and copy all necessary assets into the dist folder.
```bash
npm run build
```

### build:install
Make a symlink to install the result into your foundry data; create a `foundryconfig.json` file with your Foundry Data path.
```json
{
  "dataPath": "~/.local/share/FoundryVTT/",
}
```
`build:install` will build and set up a symlink between `dist` and your `dataPath`.
```bash
npm run build:install
```

### build:watch
`build:watch` will build and watch for changes, rebuilding automatically.
```bash
npm run build:watch
```

### clean
`clean` will remove all contents in the dist file (but keeps the link from build:install).
```bash
npm run clean
```

## Differences to create-foundry-project
- Simplified-ish
- No source files in dist folder (safe to delete)
- Watch/copy files changed
- Somewhat less safety-ckecking
- Configuration over detection