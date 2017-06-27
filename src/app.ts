import { inject, computedFrom } from "aurelia-framework";
import { Router, RouterConfiguration } from "aurelia-router";
import { AccountService } from "./base/services/account";


export class App {

  router: Router;

  constructor(@inject('config') private config: any,
              @inject private accountService: AccountService) {

  }

  @computedFrom('router')
  get nav() {
    if (!this.router) return [];
    return this.router.navigation
      .map(model => {
        let { name, icon, title, group } = model.config;
        return {
          route: name, icon, title, group
        };
      })
      .reduce((a, b) => {
        if (!b.group) return a.concat(b);
        if (a.indexOf(b.group) == -1) {
          b.group.submenu = [b];
          return a.concat(b.group);
        } else {
          b.group.submenu.push(b);
          return a;
        }
      }, []);
  }

  configureRouter(config: RouterConfiguration, router: Router) {
    // let auth = this.accountService.getMenu();
    // let auths = new Set(auth.map((a) => a.url));
    // let routes = this.config.routes.filter((a) => auths.has(a.url)).map(route => Object.assign({}, route, { nav: true }));


    let routes = this.config.routes.map(route => Object.assign({}, route, { nav: true }));
    let dashboard = { route: '', name: 'dashboard', title: "控制面板", moduleId: './dashboard', nav: true };
    let dev = { route: '/dev', name: 'dev', title: "开发", moduleId: './dev/index', nav: true };

    config.map([dashboard, ...routes, dev]);
    this.router = router;
  }
}