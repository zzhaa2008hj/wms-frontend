import { RouterConfiguration, Router } from "aurelia-router";
import { inject, Container } from 'aurelia-dependency-injection';
import { Verification } from "@app/fee/models/verification";

export class VerificationIndex {
  router: Router;
  verification = {} as Verification;
  constructor(@inject private container: Container) {
    this.container.registerInstance('chargeInvoice', this.verification);
  }
  configureRouter(config: RouterConfiguration, router: Router) {

    config.map([
      { route: '', name: 'list', moduleId: './list' },
      { route: '/:id/view', name: 'view', moduleId: './view' },
    ]);
    this.router = router;
  }

  async activate({id}) {
    this.verification.infoId = id;
  }
}