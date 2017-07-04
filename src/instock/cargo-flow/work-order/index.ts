import { Router, RouterConfiguration } from "aurelia-router";
import { CargoFlowService } from "@app/instock/services/cargo-flow";
import { CargoFlow } from "@app/instock/models/cargo-flow";
import { autoinject, Container } from "aurelia-dependency-injection";

@autoinject
export class WorkOrder {
  router: Router;
  cargoFlow = {} as CargoFlow;

  constructor(private cargoFlowService: CargoFlowService,
              private container: Container) {
    this.container.registerInstance('cargoFlow', this.cargoFlow);
  }

  configureRouter(config: RouterConfiguration, router: Router) {
    config.map([
      { route: '', name: 'list', moduleId: './list' },
      { route: '/new/:id', name: 'new', moduleId: './new', title: '新增作业' },
      { route: '/new-item/:id', name: 'new-item', moduleId: './new-item', title: '新增作业过程' }
    ]);
    this.router = router;
  }

  async activate(params) {
    let res = await this.cargoFlowService.getCargoFlowById(params.id);
    Object.assign(this.cargoFlow, res);
  }
}