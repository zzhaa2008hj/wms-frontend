import { Router, RouterConfiguration } from "aurelia-router";

export class OutstockInventory {
  router: Router;

  configureRouter(config: RouterConfiguration, router: Router) {
    config.map([
      { route: "", name: "list", moduleId: "./list" },
      { route: ":id/view", name: "view", moduleId: "./view" }
    ]);
    this.router = router;
  }
}