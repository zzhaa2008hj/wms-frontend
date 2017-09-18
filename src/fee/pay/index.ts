import { RouterConfiguration, Router } from "aurelia-router";
import { autoinject } from 'aurelia-dependency-injection';

@autoinject
export class Pay {

  router: Router;

  configureRouter(config: RouterConfiguration, router: Router) {

    config.map([
      { route: '', name: 'list', moduleId: './list' },
      { route: '/new', name: 'new', moduleId: './new', title: '新增' },
      { route: '/:id/details', name: 'details', moduleId: './details', title: '清单' },
      //{ route: '/:id/note', name: 'note', moduleId: './note' },
      { route: '/:id/confirm', name: "confirm", moduleId: './confirm', title: "客户确认" },
      { route: '/:id/verify', name: "verify", moduleId: './verify', title: "费收审核" },
      { route: '/:id/note', name: "note", moduleId: "./note", title: "生成付费单" },
      { route: '/:id/invoice', name: "invoice", moduleId: "./invoice/index", title: "录入发票" },
      { route: '/:id/requisition', name: "requisition", moduleId: "./payment-requisition", title: "汇款申请单" },
      { route: '/:id/verification', name: "verification", moduleId: "./verification/index", title: "付费核销" }
    ]);
    this.router = router;
  }

}