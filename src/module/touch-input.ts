export class TouchInput {
  mouseMoveTime = 0;
  lastDist = 0;
  touchOrigin = null;
  noTap = false;
  initiatingEvent = null;

  longPressTimeout: any;
  doubleTapTimeout: any = 0;

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

      this.longPressTimeout = setTimeout(() => {
        this.noTap = true;
        this._onLongTap(evt);
      }, 500);

      if (evt.data.originalEvent.touches.length == 2) {
        this.lastDist = this.getDist(evt.data.originalEvent.touches);
      }
      this.touchOrigin = { ...evt.data.getLocalPosition(canvas.stage) };
    });

    canvas.stage.on("touchmove", evt => {
      this.noTap = true;
      clearTimeout(this.longPressTimeout);

      if (evt.data.originalEvent.touches.length == 2) {
        this.zoom(evt.data.originalEvent);
      }
      const pos = evt.data.getLocalPosition(canvas.stage);
      const dx = this.touchOrigin.x - pos.x;
      const dy = this.touchOrigin.y - pos.y;

      //   canvas._onDragRightMove(evt);
      // canvas.stage._events.mousemove.fn(evt)

      canvas.pan({
        x: canvas.stage.pivot.x + dx,
        y: canvas.stage.pivot.y + dy,
      });
    });

    canvas.stage.on("touchend", evt => {
      clearTimeout(this.longPressTimeout);

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
        }, 200);
      }
    });

    console.log("Mobile Improvements | Touch input hooked");
  }

  private _onTap(event) {
    console.log("tapped");
    $(document.body).toggleClass("hide-hud");
  }
  private _onDrag(event) {}

  private _onDoubleTap(event) {
    console.log("doubled", event, this.initiatingEvent);
    const target = this.getTarget(event);
    console.log(target);

    if (target) {
      //@ts-ignore
      target?._onClickLeft2(event);
    }
  }
  private _onLongTap(event) {
    console.log("long");
    const target = this.getTarget(event);
    if (target) {
      //@ts-ignore
      target?._onClickRight(event);
    } else {
      console.log(event.target);
    }
  }
}
