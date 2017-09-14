import { RouterConfiguration, Router } from "aurelia-router";
import { inject, Container } from 'aurelia-dependency-injection';
import { Invoice } from "@app/fee/models/invoice";

export class InvoiceIndex {
  router: Router;
  invoice = {} as Invoice;
  constructor(@inject private container: Container) {
    this.container.registerInstance('chargeInvoice', this.invoice);
  }
  configureRouter(config: RouterConfiguration, router: Router) {

    config.map([
      { route: '', name: 'list', moduleId: './list' },
      { route: '/new', name: 'new', moduleId: './new' },
    ]);
    this.router = router;
  }

  async activate({id}) {
    this.invoice.infoId = id;
  }
}