import { computedFrom } from 'aurelia-framework';
import { Router, RouterConfiguration } from "aurelia-router";
import { UserSession } from "@app/user";
import { EventAggregator, Subscription } from "aurelia-event-aggregator";
import { DialogService } from "ui";
import { Notifier } from "@app/event-source";
import { Notifier1 } from "@app/notification";
import { NavBar } from "@app/navbar";
import { inject } from 'aurelia-dependency-injection';
kendo.culture('zh');

export class App {

  private subscriptions: Subscription[];
  router: Router;

  constructor(@inject('config') private config: any,
              @inject private notifier: Notifier,
              @inject private notifier1: Notifier1,
              @inject private navBar: NavBar,
              @inject private user: UserSession,
              @inject private events: EventAggregator,
              @inject private dialogService: DialogService) {}

  async activate() {
    await this.user.loginVerdict();
    if (!this.user.loggedIn) return;
  }

  configureRouter(config: RouterConfiguration, router: Router) {
    if (this.user.loggedIn) {
      config.options.root = document.querySelector('base').getAttribute('href');
      config.options.pushState = true;
      let auth = this.user.userInfo.menuVoList;
      let auths = new Set(auth.map((a) => a.url));
      let routes = this.config.routes
        .filter(a => auths.has(a.name))
        .map(route => Object.assign({}, route, { nav: true }));
      let dashboard = { route: '', name: 'dashboard', title: "控制面板", moduleId: './dashboard', nav: true };
      let dev = { route: '/dev', name: 'dev', title: "开发", moduleId: './dev/index', nav: true };
      config.map([dashboard, ...routes, dev]);
      this.router = router;
    } else {
      let dashboard = { route: '', name: 'dashboard', title: "控制面板", moduleId: './dashboard', nav: true };
      let dev = { route: '/dev', name: 'dev', title: "开发", moduleId: './dev/index', nav: true };
      config.map([dashboard, dev]);
      this.router = router;
    }


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

  bind() {
    this.subscriptions = [
      this.events.subscribe('user:logout', () => this.user.loginVerdict()),
      this.events.subscribe('error', err => this.dialogService.alert(
        { title: "发生错误", message: err.message, icon: 'error' }))
    ];
  }

  unbind() {
    this.subscriptions.forEach(s => s.dispose());
    this.subscriptions = null;
  }
}
