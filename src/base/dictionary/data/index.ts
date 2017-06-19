import { Router, RouterConfiguration } from "aurelia-router";
import { DictionaryService } from "../../services/dictionary";
import { autoinject, Container } from "aurelia-dependency-injection";
import { Dictionary } from "../../models/dictionary";
@autoinject
export class DictionaryDataRouter {

  router: Router;
  dictionary = {} as Dictionary;

  constructor(private dictionaryService: DictionaryService,
              private container: Container) {
    this.container.registerInstance('dictionary', this.dictionary);
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
    let res = await this.dictionaryService.getDictionary(params.id);
    Object.assign(this.dictionary, res);
  }
}