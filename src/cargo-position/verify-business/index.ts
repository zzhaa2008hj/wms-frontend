import { Router, RouterConfiguration } from "aurelia-router";
import { inject, Container } from "aurelia-dependency-injection";
import { PositionTransferInfo } from "@app/cargo-position/models/transfer-info";
import { PositionTransferInfoService } from "@app/cargo-position/services/transfer-info";

export class VerifyBusiness {
  router: Router;
  positionTransferInfo= {} as  PositionTransferInfo;

  constructor( @inject private container: Container,
    @inject private positionTransferInfoService: PositionTransferInfoService) {
    this.container.registerInstance('positionTransferInfo', this.positionTransferInfo);
  }

  configureRouter(config: RouterConfiguration, router: Router) {
    config.map([
      { route: '', name: 'verify', moduleId: './verify' },
    ]);
    this.router = router;
  }

  async activate(params) {
    //this.positionTransferInfo 
    let res = await this.positionTransferInfoService.getById(params.id);
    Object.assign(this.positionTransferInfo, res);
  }
}