enum DisplayMode {
    Full = 1,
    NoCanvas,
}

export class DisplayModes extends Application {
    mode: DisplayMode = DisplayMode.Full
    icon: JQuery = null
    board: JQuery = null
    hud: JQuery = null
    constructor() {
        super({
            template: "modules/mobile-improvements/templates/display-modes.html",
            popOut: false,
        })
    }
    protected activateListeners(html: JQuery | HTMLElement): void {
        this.icon = (<JQuery>this.element).find("i");
        this.board = $("canvas#board");
        this.hud = $("div#hud");

        (<JQuery>this.element).click(ev => {
            ev.preventDefault();
            if (this.mode == DisplayMode.Full) {
                // Enter NoCanvas mode
                this.mode = DisplayMode.NoCanvas
                this.icon.removeClass("fas")
                this.icon.addClass("far")
                canvas.app.stop()
                this.board.css("display", "none")
                this.hud.css("display", "none")
            } else {
                // Enter Full mode
                this.mode = DisplayMode.Full
                this.icon.removeClass("far")
                this.icon.addClass("fas")
                canvas.app.start()
                this.board.css("display", "block")
                this.hud.css("display", "block")
            }
        })
    }
}