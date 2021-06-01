// https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
export function viewHeight(): void {
  document.documentElement.style.setProperty(
    "--vh",
    `${Math.min(window.innerHeight, window.outerHeight) * 0.01}px`
  );
}

/** Checks that Foundry version has support for noCanvas mode */
export function noCanvasAvailable(): boolean {
  return isNewerVersion(game.data.version, "0.8.5");
}
