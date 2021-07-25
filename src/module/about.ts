export class About extends Application {
  constructor() {
    super({
      template: "modules/mobile-improvements/templates/about.hbs",
      id: "mobile-improvements-about",
      title: "MOBILEIMPROVEMENTS.MenuAbout",
      width: 300,
      height: 260,
    });
  }

  activateListeners(html: JQuery<HTMLElement>): void {
    html.find(".close-about").on("click", (evt) => {
      this.close();
    });
  }
}
