export class TouchInput {
  mouseMoveTime = 0;
  lastDist = 0;
  touchOrigin = null;
  noTap = false;
  initiatingEvent = null;

  longTapTimeout: any;
  doubleTapTimeout: any = 0;

  longTapDelay = 400;
  doubleTapTime = 200;

  getDist(touches) {
    return Math.hypot(
      touches[0].pageX - touches[1].pageX,
      touches[0].pageY - touches[1].pageY
    );
  }

  zoom(event) {
    const now = Date.now();
    const throttle = 20;

    // If it has been less than 20ms wait a bit before handling
    if (now - this.mouseMoveTime < throttle) {
      return false;
    }
    this.mouseMoveTime = now;

    const dist = this.getDist(event.touches);
    this.lastDist = this.lastDist || dist;

    const distDelta = this.lastDist - dist;
    if (distDelta < 2 && distDelta > -2) {
      return;
    }

    const dz = distDelta < 0 ? 1.05 : 0.95;
    canvas.pan({ scale: dz * canvas.stage.scale.x });
  }

  getTarget(evt): Entity {
    let target = evt.target;
    while (!target?.data && target?.parent) {
      target = target.parent;
    }
    if (!target.data) {
      return null;
    }
    return target;
  }

  hook() {
    canvas.stage.on("touchstart", evt => {
      this.initiatingEvent = evt;
      this.longTapTimeout = setTimeout(() => {
        this.noTap = true;
        this._onLongTap(evt);
      }, this.longTapDelay);

      if (evt.data.originalEvent.touches.length == 2) {
        this.lastDist = this.getDist(evt.data.originalEvent.touches);
      }
      this.touchOrigin = { ...evt.data.getLocalPosition(canvas.stage) };
    });

    canvas.stage.on("touchmove", evt => {
      this.noTap = true;
      clearTimeout(this.longTapTimeout);

      if (evt.data.originalEvent.touches.length == 2) {
        this.zoom(evt.data.originalEvent);
      }
      const pos = evt.data.getLocalPosition(canvas.stage);
      const dx = this.touchOrigin.x - pos.x;
      const dy = this.touchOrigin.y - pos.y;
      this._onDrag(dx, dy);
    });

    canvas.stage.on("touchend", evt => {
      clearTimeout(this.longTapTimeout);

      if (this.noTap) {
        this.noTap = false;
        return;
      }

      if (this.doubleTapTimeout != 0) {
        // Before timeout
        clearTimeout(this.doubleTapTimeout);
        this.doubleTapTimeout = 0;
        this._onDoubleTap(evt);
      } else {
        this.doubleTapTimeout = setTimeout(() => {
          this._onTap(evt);
          this.doubleTapTimeout = 0;
        }, this.doubleTapTime);
      }
    });

    console.log("Mobile Improvements | Touch input hooked");
  }

  private _onTap(event) {
    $(document.body).toggleClass("hide-hud");
  }
  private _onDrag(dx, dy) {
    canvas.pan({
      x: canvas.stage.pivot.x + dx,
      y: canvas.stage.pivot.y + dy,
    });
  }

  private _onDoubleTap(event) {
    const target = this.getTarget(event);

    //@ts-ignore
    if (target && target._canView(game.user, event)) {
      //@ts-ignore
      target?._onClickLeft2(event);
    }
  }
  private _onLongTap(event) {
    const target = this.getTarget(event);
    //@ts-ignore
    if (target && target._canHUD(game.user, event)) {
      //@ts-ignore
      target?._onClickRight(event);
    }
  }
}
