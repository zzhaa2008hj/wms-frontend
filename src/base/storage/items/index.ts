import { Router, RouterConfiguration } from "aurelia-router";
import {StorageInfo} from "@app/base/models/storage";
import { inject, Container } from "aurelia-dependency-injection";

export class StorageItems {

  router: Router;
  storageInfo = {} as StorageInfo;

  constructor(@inject private container: Container) {
    this.container.registerInstance('storageInfo', this.storageInfo);
  }

  configureRouter(config: RouterConfiguration, router: Router) {
    config.map([
      { route: '', name: 'list', moduleId: './list' },
      { route: '/new', name: 'new', moduleId: './new', title: "新增" },
      { route: '/:id/edit', name: 'edit', moduleId: './edit', title: "编辑" },
    ]);
    this.router = router;

  }

  async activate(params) {
    this.storageInfo.id = params.id;
  }
}