import { computedFrom } from 'aurelia-framework';
import { Router, RouterConfiguration } from "aurelia-router";
import { Notifier } from "@app/event-source";
import { Notifier1 } from "@app/notification";
import { NavBar } from "@app/navbar";
import { inject } from 'aurelia-dependency-injection';
kendo.culture('zh');

export class App {

  router: Router;

  constructor(@inject('config') private config: any,
              @inject private notifier: Notifier,
              @inject private notifier1: Notifier1,
              @inject private navBar: NavBar) {

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
    //let auth = this.accountService.getMenu();
    //let auths = new Set(auth.map((a) => a.url));
    //let routes = this.config.routes.filter((a) => auths.has(a.code)).map(route => Object.assign({}, route, { nav: true }));

    let group1 = {
      title: "基础",
      icon: "settings",
      expanded: false,
    };
    let group2 = {
      title: "入库",
      icon: "format_indent_increase",
      expanded: false,
    };
    let group3 = {
      title: "出库",
      icon: "format_indent_decrease",
      expanded: false,
    };
    let group4 = {
      title: "费用",
      icon: "payment",
      expanded: false,
    };
    let group5 = {
      title: "报表",
      icon: "assessment",
      expanded: false,
    };

    //let routes = this.config.routes.map(route => Object.assign({}, route, { nav: true }));
    let routes = [{
      "route": "/report",
      "name": "report",
      "title": "报表",
      "moduleId": "./report/index"
    },
    {
      "route": "/base/attachments",
      "name": "attachments",
      "title": "附件",
      "moduleId": "./common/attachment/index",
      group: group1,
      nav: true
    },
    {
      "route": "/base/cargo-category",
      "name": "cargoCategory",
      "title": "货物种类",
      "moduleId": "./base/cargo-category/index",
      group: group1,
      nav: true
    },
    {
      "route": "/base/contract",
      "name": "contract",
      "title": "合同",
      "moduleId": "./base/contract/index",
      group: group1,
      nav: true
    },
    {
      "route": "/base/handling-customer",
      "name": "handling-customer",
      "title": "装卸单位",
      "moduleId": "./base/customer/handling-customer/index",
      group: group1,
      nav: true
    },
    {
      "route": "/base/warehouse-customer",
      "name": "warehouse-customer",
      "title": "仓储客户",
      "moduleId": "./base/customer/warehouse-customer/index",
      group: group1,
      nav: true
    },
    {
      "route": "/base/dictionary",
      "name": "dictionary",
      "title": "数据字典",
      "moduleId": "./base/dictionary/index",
      group: group1,
      nav: true
    },
    {
      "route": "/base/employee",
      "name": "employee",
      "title": "用户",
      "moduleId": "./base/employee/index",
      group: group1,
      nav: true
    },
    {
      "route": "/base/message",
      "name": "message",
      "title": "站内信",
      "moduleId": "./base/message/index",
      group: group1,
      nav: true
    },
    {
      "route": "/base/notice",
      "name": "notice",
      "title": "公告",
      "moduleId": "./base/notice/index",
      group: group1,
      nav: true
    },
    {
      "route": "/base/operation-logs",
      "name": "operation-log",
      "title": "操作日志",
      "moduleId": "./base/operation-logs/index",
      group: group1,
      nav: true
    },
    {
      "route": "/base/organization-roles",
      "name": "organization-roles",
      "title": "角色管理",
      "moduleId": "./base/organization-role/index",
      group: group1,
      nav: true
    },
    {
      "route": "/base/rate",
      "name": "rate",
      "title": "基础费率",
      "moduleId": "./base/rate/index",
      group: group1,
      nav: true
    },
    {
      "route": "/base/warehouse",
      "name": "warehouse",
      "title": "仓库库区",
      "moduleId": "./base/warehouse/index",
      group: group1,
      nav: true
    },
    {
      "route": "/base/work-info",
      "name": "workInfo",
      "title": "作业内容",
      "moduleId": "./base/work-info/index",
      group: group1,
      nav: true
    },
    {
      "route": "/base/verify-records",
      "name": "verifyRecord",
      "title": "审核审批",
      "moduleId": "./common/verify-records/index",
      group: group1,
      nav: true
    },
    {
      "route": "/instock/cargo-infos",
      "name": "cargoInfo",
      "title": "客户入库指令",
      "moduleId": "./base/cargo-info/index",
      group: group2,
      nav: true
    },
    {
      "route": "/instock/:infoId?/cargo-flows",
      "href": "/instock/cargo-flows",
      "name": "cargoFlow",
      "title": "入库流水",
      "moduleId": "./instock/cargo-flow/index",
      group: group2,
      nav: true
    },
    {
      "route": "/instock/:infoId?/instock-orders",
      "href": "/instock/instock-orders",
      "name": "instockOrder",
      "title": "入库单",
      "moduleId": "./instock/order/index",
      group: group2,
      nav: true
    },
    {
      "route": "/instock/:infoId?/order-items",
      "href": "/instock/order-items",
      "name": "orderItem",
      "title": "理货报告",
      "moduleId": "./instock/order-item/index",
      group: group2,
      nav: true
    },
    {
      "route": "/instock/work-statistics",
      "name": "workStatistics",
      "title": "作业统计",
      "moduleId": "./instock/work-statistics/index",
      group: group2,
      nav: true
    },
    {
      "route": "/base/storage",
      "name": "storage",
      "title": "库存",
      "moduleId": "./base/storage/index",
      group: group2,
      nav: true
    },
    {
      "route": "/base/storage-history",
      "name": "storage-history",
      "title": "库存流水",
      "moduleId": "./base/storage-history/index",
      group: group2,
      nav: true
    },
    {
      "route": "/outstock/:infoId?/outstock-orders",
      "href": "/outstock/outstock-orders",
      "name": "outstockOrder",
      "title": "出库指令",
      "moduleId": "./outstock/order/index",
      group: group3,
      nav: true
    },
    {
      "route": "/outstock/cargo-distrain",
      "name": "cargo-distrain",
      "title": "费收扣量",
      "moduleId": "./outstock/cargo-distrain/index",
      group: group3,
      nav: true
    },
    {
      "route": "/outstock/order/item",
      "name": "outstock-orderItem",
      "title": "出库单",
      "moduleId": "./outstock/order/item/index",
      group: group3,
      nav: true
    },
    {
      "route": "/outstock/inventory",
      "name": "inventory",
      "title": "出库清单",
      "moduleId": "./outstock/inventory/index",
      group: group3,
      nav: true
    },
    {
      "route": "/fee/charge",
      "name": "charge",
      "title": "收费",
      "moduleId": "./fee/charge/index",
      group: group4,
      nav: true
    },
    {
      "route": "/fee/pay",
      "name": "pay",
      "title": "装卸结算",
      "moduleId": "./fee/pay/index",
      group: group4,
      nav: true
    },
    {
      "route": "/report/daily-inventory",
      "name": "daily-inventory",
      "title": "出入库明细",
      "moduleId": "./report/daily-inventory/index",
      group: group5,
      nav: true
    }];

    let dashboard = {
      route: ['', 'main'], name: 'dashboard', title: "首页", moduleId: './dashboard', nav: true, icon: "home"
    };
    //let dev = { route: '/dev', name: 'dev', title: "开发", moduleId: './dev/index', nav: true };

    config.map([dashboard, ...routes]);
    this.router = router;
  }
}