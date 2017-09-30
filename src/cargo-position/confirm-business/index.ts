import { Router, RouterConfiguration } from "aurelia-router";
import { autoinject, Container } from "aurelia-dependency-injection";
import { PositionTransferInfoService } from "@app/cargo-position/services/transfer-info";
import { PositionTransferInfo } from "@app/cargo-position/models/transfer-info";
@autoinject
export class VerifyFlow {
  router: Router;
  positionTransferInfo = {} as PositionTransferInfo;

  constructor(private container: Container,
              private positionTransferInfoService: PositionTransferInfoService) {
    this.container.registerInstance('positionTransferInfo', this.positionTransferInfo);
  }

  configureRouter(config: RouterConfiguration, router: Router) {
    config.map([
      { route: '', name: 'list', moduleId: './list' },
    ]);
    this.router = router;
  }

  async activate(params) {
    let res = await this.positionTransferInfoService.getById(params.id);
    Object.assign(this.positionTransferInfo, res);
  }
}