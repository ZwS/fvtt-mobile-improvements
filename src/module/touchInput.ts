export class TouchInput {
  cancelled = false;
  tapMaxTime = 400;
  tapStart = -1;

  getTarget(evt: PIXI.InteractionEvent): PlaceableObject {
    let target = evt.target as PlaceableObject;
    while (!target?.data && target?.parent) {
      target = target.parent as PlaceableObject;
    }
    if (!target.data) {
      return null;
    }
    return target;
  }

  hook(): void {
    if (!canvas.ready) return;
    canvas.stage.on("touchstart", (evt) => {
      this.tapStart = Date.now();
      if (evt.data.originalEvent.touches.length > 1) {
        this.cancelled = true;
      }
    });

    canvas.stage.on("touchmove", () => (this.cancelled = true));

    canvas.stage.on("touchend", (evt) => {
      if (!this.cancelled && Date.now() - this.tapStart < this.tapMaxTime) {
        const target = this.getTarget(evt);
        if (!target) {
          $(document.body).toggleClass("hide-hud");
        }
      }
      this.cancelled = false;
    });

    console.log("Mobile Improvements | Touch tap hooked");
  }
}
