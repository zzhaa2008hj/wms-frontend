import { Router, RouterConfiguration } from "aurelia-router";
import { CargoFlowService } from "@app/instock/services/cargo-flow";
import { CargoFlow } from "@app/instock/models/cargo-flow";
import { autoinject, Container } from "aurelia-dependency-injection";

@autoinject
export class VerifyFlow {
  router: Router;
  cargoFlow = {} as CargoFlow;

  constructor(private cargoFlowService: CargoFlowService,
              private container: Container) {
    this.container.registerInstance('cargoFlow', this.cargoFlow);
  }

  configureRouter(config: RouterConfiguration, router: Router) {
    config.map([
      { route: '', name: 'list', moduleId: './list' },
      { route: '/:id/view', name: 'view', moduleId: './view', title: '详情' }
    ]);
    this.router = router;
  }

  async activate(params) {
    let res = await this.cargoFlowService.getCargoFlowById(params.id);
    Object.assign(this.cargoFlow, res);
  }
}