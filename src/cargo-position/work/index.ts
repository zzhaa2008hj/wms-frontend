import { Router, RouterConfiguration } from "aurelia-router";
import { PositionTransferInfo } from "@app/cargo-position/models/transfer-info";

export class Work {
  router: Router;
  positionTransferInfo = {} as PositionTransferInfo;

  constructor() {
  }

  configureRouter(config: RouterConfiguration, router: Router) {
    config.map([
      { route: '', name: 'list', moduleId: './list' },
      { route: '/:id/transfer-work', name: 'transfer-work', moduleId: './edit', title: "货位转移作业" }
    ]);
    this.router = router;
  }

}