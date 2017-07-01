import {Router, RouterConfiguration} from "aurelia-router";
import {autoinject} from "aurelia-dependency-injection";

@autoinject
export class RoleList {

  router: Router;

  configureRouter(config: RouterConfiguration, router: Router): void {
    this.router = router;
    config.map([
      {route: '', name: 'list', moduleId: './list'},
    ]);
  }

}