import { RouterConfiguration, Router } from "aurelia-router";

export class CargoInfo {

  router: Router;

  configureRouter(config: RouterConfiguration, router: Router) {

    config.map([
      { route: '', name: 'list', moduleId: './list' },
      { route: 'new', name: 'new', moduleId: './new', title: "新增" },
      { route: ':id/edit', name: 'edit', moduleId: './edit', title: "编辑" },
      { route: ':id/details', name: 'details', moduleId: './details', title: "详情" }
    ]);
    this.router = router;
  }

}