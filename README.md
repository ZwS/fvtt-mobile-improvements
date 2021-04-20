# Mobile Improvements - Flexible view for Foundry VTT

Mobile Improvements changes the core UI to be flexible for use with mobiles,
tablets and other low-resolution devices.

Current state: Useful for general UI interaction. TouchVTT module recommended
for interacting with the map.

**Mobile Improvements is in a pre-release phase and may have breaking changes or
change default settings without notice**

# Installation

Release version is old and unsupported. Use the unstable branch or wait for
version 1.0! ~~Mobile Improvements is available in the in-application module
browser. It can also be installed manually with the following manifest URL:~~

```
https://gitlab.com/fvtt-modules-lab/mobile-improvements/-/jobs/artifacts/master/raw/module.json?job=build-module
```

## Unstable branch

If you want to live on the edge, you can use the latest version from the develop
branch, but there may be unfinished features and rough edges.

```
https://gitlab.com/fvtt-modules-lab/quick-insert/-/jobs/artifacts/develop/raw/module.json?job=build-unstable
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
- Disable rendering the game board, to increase performance
