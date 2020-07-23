// Redeclare protected methods so we can u use them directly
declare class Placeable extends PlaceableObject {
  _onHoverIn(
    event: PIXI.interaction.InteractionEvent,
    { hoverOutOthers }?: { hoverOutOthers?: boolean }
  ): boolean;
  _onHoverOut(event: PIXI.interaction.InteractionEvent): boolean;
  _onClickLeft(event: PIXI.interaction.InteractionEvent): boolean;
  _onClickLeft2(event: PIXI.interaction.InteractionEvent): boolean;
  _onClickRight(event: PIXI.interaction.InteractionEvent): void;
  _onClickRight2(event: PIXI.interaction.InteractionEvent): void;
  _onDragLeftStart(event: PIXI.interaction.InteractionEvent): void;
  _onDragLeftMove(event: PIXI.interaction.InteractionEvent): void;
  _onDragLeftDrop(event: PIXI.interaction.InteractionEvent): Entity;
  _onDragLeftCancel(event: PIXI.interaction.InteractionEvent): void;

  // PlaceableObject.can() changes the case of input string, expose this instead
  _canHUD(user: User, event?: Event): boolean;
}

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

  tapFocus: Placeable = null;

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

  getTarget(evt): Placeable {
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
    const target = this.getTarget(event);
    if (!target && !this.tapFocus) {
      $(document.body).toggleClass("hide-hud");
    }

    if (this.tapFocus) {
      this.tapFocus._onHoverOut(null);
      this.tapFocus = null;
    }

    if (!target) return;
    if (target.can(game.user, "Hover")) {
      this.tapFocus = target;
      target._onHoverIn(null, { hoverOutOthers: true });
    }
  }
  private _onDrag(dx, dy) {
    canvas.pan({
      x: canvas.stage.pivot.x + dx,
      y: canvas.stage.pivot.y + dy,
    });
  }

  private _onDoubleTap(event) {
    const target = this.getTarget(event);

    if (target && target.can(game.user, "View")) {
      //@ts-ignore
      target._onClickLeft2(event);
    }
  }

  private _onLongTap(event) {
    const target = this.getTarget(event);
    if (target && target._canHUD(game.user, null)) {
      target._onClickRight(event);
    }
  }
}
