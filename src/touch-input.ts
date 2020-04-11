
export class TouchInput {
    mouseMoveTime = 0
    lastDist = 0

    getDist(touches) {
        return Math.hypot(
            touches[0].pageX - touches[1].pageX,
            touches[0].pageY - touches[1].pageY)
    }

    zoom(event) {
        const now = Date.now();
        const throttle = 20;

        // If it has been less than 20ms wait a bit before handling
        if ((now - this.mouseMoveTime) < throttle) {
            return false
        }
        this.mouseMoveTime = now

        const dist = this.getDist(event.touches)
        this.lastDist = this.lastDist || dist

        const distDelta = this.lastDist - dist
        if (distDelta < 2 && distDelta > -2) {
            return
        }

        const dz = (distDelta < 0) ? 1.05 : 0.95;
        canvas.pan({ scale: dz * canvas.stage.scale.x });

    }

    init() {
        canvas.stage.on("touchstart", (evt) => {
            if (evt.data.originalEvent.touches.length == 2) {
                this.lastDist = this.getDist(evt.data.originalEvent.touches)
            }
            canvas.stage._events.rightdown.fn(evt)
        })

        canvas.stage.on("touchmove", (evt) => {
            if (evt.data.originalEvent.touches.length == 2) {
                this.zoom(evt.data.originalEvent)
            }
            canvas.stage._events.mousemove.fn(evt)
        })

        canvas.stage.on("touchend", (evt) => {
            canvas.stage._events.rightup.fn(evt)
        })

    }
}
