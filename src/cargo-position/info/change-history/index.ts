
import { RouterConfiguration, Router } from "aurelia-router";
import { autoinject, Container } from 'aurelia-dependency-injection';
import { ChangeHistory } from '@app/common/models/change-history';

@autoinject
export class OrderChangeHistory {

  router: Router;
  changeHistory = {} as ChangeHistory<any>;

  constructor(private container: Container) {
    this.container.registerInstance('changeHistory', this.changeHistory);
  }

  configureRouter(config: RouterConfiguration, router: Router) {

    config.map([
      { route: '', name: 'list', moduleId: './list' }
    ]);
    this.router = router;
  }

  async activate(params) {
    let res = {} as ChangeHistory<any>;
    res.businessId = params.id;
    Object.assign(this.changeHistory, res);
  }
}