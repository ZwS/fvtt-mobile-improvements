# Mobile Improvements - Flexible view for Foundry VTT

This module is intended to make the UI more flexible for use with mobiles,
tablets and other low-resolution devices.

Current state: Useful for general UI interaction. Map interaction is working,
but limited.

**Mobile Improvements is in a pre-release phase and may have breaking changes or
change default settings without notice**

```
https://gitlab.com/fvtt-modules-lab/mobile-improvements/-/jobs/artifacts/master/raw/module.json?job=build-module
```

# Features

Mobile Improvements comes in two major parts:

1. Complete core UI overhaul
2. Flexible character sheets

## General features

- Full-screen application windows
- Full-screen sidebar
- Window switching
  - List and switch between open windows
  - Minimizing windows hides them
- Flexible-ish macro bar
- Disable map toggle
  - Disable rendering the game board, to increase performance

# TODO

- Ensure disabling of canvas is actually doing something to performance
- Application window list view

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

Make a symlink to install the result into your foundry data; create a
`foundryconfig.json` file with your Foundry Data path.

```json
{
  "dataPath": "~/.local/share/FoundryVTT/"
}
```

`build:install` will build and set up a symlink between `dist` and your
`dataPath`.

```bash
npm run build:install
```

### build:watch

`build:watch` will build and watch for changes, rebuilding automatically.

```bash
npm run build:watch
```

### clean

`clean` will remove all contents in the dist folder (but keeps the link from
build:install).

```bash
npm run clean
```
