import { settings, getSetting } from "./settings.js";
import { WindowMenu } from "./windowMenu.js";
import { MobileMenu } from "./mobileMenu.js";

export enum ViewState {
  Map,
  Sidebar,
}
enum DrawerState {
  None,
  Macros = "macros",
  Menu = "menu",
  Windows = "windows",
}

declare let ui: { sidebar: Sidebar; hotbar: any };

function isTabletMode() {
  return globalThis.MobileMode.enabled && window.innerWidth > 900;
}

export class MobileNavigation extends Application {
  state: ViewState = ViewState.Map;
  drawerState: DrawerState = DrawerState.None;

  windowMenu: WindowMenu;
  mobileMenu: MobileMenu;

  constructor() {
    super({
      template: "modules/mobile-improvements/templates/navigation.hbs",
      popOut: false,
    });

    this.windowMenu = new WindowMenu(this);
    this.mobileMenu = new MobileMenu(this);

    // Ensure HUD shows on opening a new window
    Hooks.on("WindowManager:NewRendered", () => this._onShowWindow());
    Hooks.on("WindowManager:BroughtToTop", () => this._onShowWindow());
  }

  _onShowWindow() {
    $(document.body).removeClass("hide-hud");
    if (isTabletMode()) {
      this.showSidebar();
    }
  }

  render(force: boolean, ...arg) {
    const r = super.render(force, ...arg);
    this.windowMenu.render(force);
    this.mobileMenu.render(force);
    return r;
  }

  activateListeners(html: JQuery<HTMLElement>): void {
    html.find("li").on("click", (evt, as) => {
      const [firstClass] = evt.currentTarget.className.split(" ");
      const [_, name] = firstClass.split("-");
      this.selectItem(name);
    });
    this.updateMode();
    html.before(
      `<div id="show-mobile-navigation"><i class="fas fa-chevron-up"></i></div>`
    );
    html.siblings("#show-mobile-navigation").on("click", () => {
      $(document.body).toggleClass("hide-hud");
    });
  }

  closeDrawer() {
    this.setDrawerState(DrawerState.None);
  }

  showMap() {
    const minimized = window.WindowManager.minimizeAll();
    if (!minimized && this.state == ViewState.Map) {
      $(document.body).toggleClass("hide-hud");
    }
    this.state = ViewState.Map;
    canvas.ready && canvas.app.start();
    this.setDrawerState(DrawerState.None);
    this.updateMode();
  }

  showSidebar() {
    this.state = ViewState.Sidebar;
    $(document.body).removeClass("hide-hud");
    ui.sidebar.expand();
    if (!isTabletMode()) window.WindowManager.minimizeAll();

    if (getSetting(settings.SIDEBAR_PAUSES_RENDER) === true) {
      // canvas.ready && canvas.app.stop();
    }
    this.setDrawerState(DrawerState.None);
    this.updateMode();
  }

  showHotbar() {
    $(document.body).addClass("show-hotbar");
    ui.hotbar.expand();
  }

  hideHotbar() {
    $(document.body).removeClass("show-hotbar");
  }

  setWindowCount(count: number) {
    this.element.find(".navigation-windows .count").html(count.toString());
    if (count === 0) {
      this.element.find(".navigation-windows").addClass("disabled");
    } else {
      this.element.find(".navigation-windows").removeClass("disabled");
    }
    if (this.drawerState == DrawerState.Windows) {
      this.setDrawerState(DrawerState.None);
    }
  }

  setDrawerState(state: DrawerState) {
    $(`body > .drawer`).removeClass("open");
    this.element.find(".toggle.active").removeClass("active");
    this.hideHotbar();
    if (state == DrawerState.None || state == this.drawerState) {
      this.drawerState = DrawerState.None;
      return;
    }

    this.drawerState = state;
    if (state == DrawerState.Macros) {
      this.showHotbar();
    } else {
      $(`body > .drawer.drawer-${state}`).addClass("open");
    }
    this.element.find(`.navigation-${state}`).addClass("active");
  }

  selectItem(name: string) {
    console.log(name);
    switch (name) {
      case "map":
        this.showMap();
        break;
      case "sidebar":
        this.showSidebar();
        break;
      default:
        this.setDrawerState(name as DrawerState);
    }
  }

  updateMode() {
    this.element.find(".active:not(.toggle)").removeClass("active");
    $(document.body).removeClass("show-sidebar");

    switch (this.state) {
      case ViewState.Map:
        this.element.find(".navigation-map").addClass("active");
        break;
      case ViewState.Sidebar:
        this.element.find(".navigation-sidebar").addClass("active");
        $(document.body).addClass("show-sidebar");
        break;
      default:
        break;
    }
  }
}
