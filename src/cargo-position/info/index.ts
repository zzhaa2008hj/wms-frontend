import { Router, RouterConfiguration } from "aurelia-router";

export class PositionTransferInfo {
  router: Router;

  configureRouter(config: RouterConfiguration, router: Router) {
    config.map([
      { route: '', name: 'list', moduleId: './list' },
      { route: '/new', name: 'new', moduleId: './new', title: '新增' },
      { route: '/:id/edit', name: 'edit', moduleId: './edit', title: '修改' },
      { route: '/:id/change-historys', name: 'changeHistory', moduleId: './change-history/index', title: "修改记录" },
      { route: '/:id/detail', name: 'detail', moduleId: './detail', title: '查看' },
      {
        route: '/:id/business-verify',
        name: 'business-verify',
        moduleId: '/dist/cargo-position/verify-business/index',
        title: '商务审核'
      },
      {
        route: '/:id/print-confirm',
        name: 'print-confirm',
        moduleId: '/dist/cargo-position/confirm/print-confirm',
        title: '打印签字确认单'
      },
      {
        route: '/:id/upload-confirm',
        name: 'upload-confirm',
        moduleId: '/dist/cargo-position/confirm/upload-confirm',
        title: '上传签字确认单'
      },
      {
        route: '/:id/:type/work-order',
        name: 'work-order',
        moduleId: '/dist/cargo-position/work/index',
        title: "添加作业信息"
      },
      {
        route: '/:id/verify-warehouse',
        name: 'verify-warehouse',
        moduleId: '/dist/cargo-position/verify-warehouse/index',
        title: '库场审核'
      },
      {
        route: '/:id/confirm-business',
        name: 'confirm-business',
        moduleId: '/dist/cargo-position/confirm-business/index',
        title: '商务确认'
      }
    ]);
    this.router = router;
  }

}