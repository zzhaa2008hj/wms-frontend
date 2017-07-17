import { Router, RouterConfiguration } from "aurelia-router";
import { inject, Container } from "aurelia-dependency-injection";
import { CargoFlow } from "@app/instock/models/cargo-flow";

export class VerifyBusiness {
  router: Router;
  cargoFlow = {} as CargoFlow;

  constructor(@inject private container: Container) {
    this.container.registerInstance('cargoFlowId', this.cargoFlow);
  }

  configureRouter(config: RouterConfiguration, router: Router) {
    config.map([
      { route: '', name: 'edit', moduleId: './edit' },
    ]);
    this.router = router;
  }

  async activate({id}) {
    this.cargoFlow.id = id;
  }
}