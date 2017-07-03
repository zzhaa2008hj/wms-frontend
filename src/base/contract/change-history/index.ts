
import { RouterConfiguration, Router } from "aurelia-router";
import { Container, autoinject } from 'aurelia-dependency-injection';
import { Contract } from '@app/base/models/contract';
import { ContractService } from '@app/base/services/contract';

@autoinject
export class ContractCHangeHistory {

  router: Router;
  contract = {} as Contract;

  constructor(private container: Container,
              private contractService: ContractService) {
    this.container.registerInstance('contract', this.contract);
  }

  configureRouter(config: RouterConfiguration, router: Router) {

    config.map([
      { route: '', name: 'list', moduleId: './list' }
    ]);
    this.router = router;
  }

  async activate(params) {
    let res = await this.contractService.getContractBaseInfo(params.id);
    Object.assign(this.contract, res);
  }
}