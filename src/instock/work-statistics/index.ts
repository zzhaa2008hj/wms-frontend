import { Router, RouterConfiguration } from "aurelia-router";
export class WorkStatisticsRouter {
  router: Router;

  configureRouter(config: RouterConfiguration, router: Router) {
    config.map([
      { route: "", name: "list", moduleId: "./list" },
      { route: "new", name: "new", moduleId: "./new", title: "新增" },
      { route: "view/:id", name: "view", moduleId: "./view", title: "详情" }
    ]);
    this.router = router;
  }
}