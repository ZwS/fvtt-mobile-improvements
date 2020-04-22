# Mobile Improvements - Flexible view for Foundry VTT
This module is intended to make the UI more flexible for use with mobiles, tablets and other low-resolution devices.

Current state: Useful for general UI interaction. Map does not work with touch input.

**Mobile Improvements is in a pre-release phase and may have breaking changes or change default settings without notice**
```
https://gitlab.com/fvtt-modules-lab/mobile-improvements/-/jobs/artifacts/master/raw/module.json?job=build-module
```

# Features
- Full-screen application windows
- Full-screen sidebar
- Window switching
  - List and switch between open windows
  - Minimizing windows hides them
- Flexible-ish macro bar
- Disable map toggle
  - Disable rendering the game board, to increase performance
- Pan and Zoom with touch input
  - Some simple hacks to pan and zoom with touch input (zoom is quite bad right now)

## dnd5e
- Narrower character sheets

# TODO
- Ensure disabling of canvas is actually doing something to performance
- Application window view
  - Full-view windows (ongoing)
    - Better dialogs
  - Window navigation improvements
    - Performance
      - don't do a full re-render on each window add/remove
    - Minimize all
    - Minimize button on app header
    - Reorder the list?

- Settings
  - Individual settings for each feature (except for css)

- Action bar improvements
  - Spacing and distribution
  - New list?

- Some kind of toggle between app/scene views

- Map interaction
  - Selection
  - Movement
  - Manual map controls (maybe)
    - Alternative to touch control; pan and zoom controls

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
`clean` will remove all contents in the dist folder (but keeps the link from build:install).
```bash
npm run clean
```

## Differences to create-foundry-project
- Simplified-ish
- No source files in dist folder (safe to delete)
- Watch/copy files changed
- Somewhat less safety-ckecking
- Configuration over detection
- Builds manifest from package.json