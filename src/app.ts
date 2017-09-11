import { computedFrom } from 'aurelia-framework';
import { Router, RouterConfiguration } from "aurelia-router";
import { UserSession } from "@app/user";
import { EventAggregator, Subscription } from "aurelia-event-aggregator";
import { DialogService } from "ui";
import { inject } from 'aurelia-dependency-injection';
import { Notifier } from '@app/event-source';
import { Notifier1 } from '@app/notification';
kendo.culture('zh');

export class App {

  router: Router;
  private subscriptions: Subscription[];

  constructor(@inject('config') private config: any,
              @inject private n: Notifier,
              @inject private n1: Notifier1,
              @inject private user: UserSession,
              @inject private events: EventAggregator,
              @inject private dialogService: DialogService) {
    this.user.loginUrl = this.config.loginParam.loginUrl;
    this.user.loginOutUrl = this.config.loginParam.loginOutUrl;
    this.user.changePasswordUrl = this.config.loginParam.changePasswordUrl;
    this.user.appKey = this.config.loginParam.appKey;
    this.user.appType = this.config.loginParam.appType;
  }

  async activate() {
    console.debug(this.n);
    console.debug(this.n1);

    this.subscriptions = [
      this.events.subscribe('user:logout', () => this.user.loginVerdict()),
      this.events.subscribe('error', err => this.dialogService.alert(
        { title: '发生错误', message: err.message, icon: 'error' })),
      this.events.subscribe('error-403', async err => {
        await this.dialogService.alert({ title: '发生错误', message: err.message, icon: 'error' });
        window.location.href = window.location.protocol + '//' + window.location.host;
      }),
      this.events.subscribe('error-401', async err => {
        await this.dialogService.alert({ title: '发生错误', message: err, icon: 'error' });
        // let url = this.config.loginParam.loginUrl + "?appKey=" + this.config.loginParam.appKey + "&appType=" + this.config.loginParam.appType + "&returnUrl=" + encodeURIComponent(window.location.href);
        // window.location.href = url;
        this.user.login();
      })
    ];

    await this.user.loginVerdict();
    if (!this.user.loggedIn) return;
  }

  configureRouter(config: RouterConfiguration, router: Router) {
    let dashboard = { route: '', name: 'dashboard', title: "首页", moduleId: './dashboard', nav: true, icon: 'home' };
    let notice = {
      route: "/base/notifications", name: "notifications", title: "消息通知",
      moduleId: "./base/notifications/notifications-list"
    };
    let changePassword = {
      route: '/change-password', name: 'changePassword', title: "修改密码",
      moduleId: './change-password', nav: false
    };
    config.mapUnknownRoutes('dashboard');
    config.map([dashboard, notice, changePassword]);
    if (this.user.loggedIn) {
      config.options.root = document.querySelector('base').getAttribute('href');
      config.options.pushState = true;
      let auth = this.user.userInfo.menuVoList;
      let auths = new Set(auth.map((a) => a.url));
      let routes = this.config.routes
        .filter(a => auths.has(a.name))
        .map(route => {
          if (!route["group"]) return Object.assign({}, route, { nav: true });
          return Object.assign({}, route, { nav: true, group: this.config.group[route.group] });
        });
      config.map([...routes]);
    }
    this.router = router;
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

  deactivate() {
    this.subscriptions.forEach(s => s.dispose());
    this.subscriptions = null;
  }
}
