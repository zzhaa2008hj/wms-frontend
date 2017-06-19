import { Router, RouterConfiguration } from "aurelia-router";
import { RateService } from "../../services/rate";
import { autoinject, Container } from "aurelia-dependency-injection";
import { Rate } from "../../models/rate";
@autoinject
export class RateStepRouter {

  router: Router;
  rate = {} as Rate;

  constructor(private rateService: RateService,
              private container: Container) {
    this.container.registerInstance('rate', this.rate);
  }

  configureRouter(config: RouterConfiguration, router: Router) {
    config.map([
      { route: '', name: 'list', moduleId: './list' },
      { route: '/new', name: 'new', moduleId: './new', title: "新增" },
      { route: '/edit', name: 'edit', moduleId: './edit', title: "编辑" },
    ]);
    this.router = router;

  }

  async activate(params) {
    let res = await this.rateService.getRate(params.id);
    Object.assign(this.rate, res);
  }
}