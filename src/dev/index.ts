import { RouterConfiguration, Router } from "aurelia-router";

export class Dev {

  router: Router;

  configureRouter(config: RouterConfiguration, router: Router) {
    config.map([
      { route: '', name: 'home', title: "Home", moduleId: './home' },
      { route: '/ui', name: 'ui', title: "UI组件", moduleId: './ui', nav: true },
      { route: '/upload', name: 'upload', title: "上传", moduleId: './upload', nav: true }
    ]);
    
    this.router = router;

  }

}