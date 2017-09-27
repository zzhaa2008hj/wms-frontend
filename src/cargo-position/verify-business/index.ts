import { Router, RouterConfiguration } from "aurelia-router";
import { inject, Container } from "aurelia-dependency-injection";
import { PositionTransferInfo } from "@app/cargo-position/models/transfer-info";

export class VerifyBusiness {
  router: Router;
  positionTransferInfo = {} as PositionTransferInfo;

  constructor(@inject private container: Container) {
    this.container.registerInstance('positionTransferInfo', this.positionTransferInfo);
  }

  configureRouter(config: RouterConfiguration, router: Router) {
    config.map([
      { route: '', name: 'verify', moduleId: './verify' },
    ]);
    this.router = router;
  }

  async activate(e) {
    this.positionTransferInfo = e;
  }
}