import { RouterConfiguration, Router } from "aurelia-router";
import { autoinject, Container } from 'aurelia-dependency-injection';
import { CargoownershipTransfer } from "src/cargo-ownership/models/cargo-ownership";
import { CargoownershipTransferService } from "@app/cargo-ownership/services/cargo-ownership";

@autoinject
export class AuditRouter {

  router: Router;

  private transfer = {} as CargoownershipTransfer ;

  constructor(private container: Container,
              private  cargoownershipTransferService : CargoownershipTransferService){
    this.container.registerInstance("transferInfo",this.transfer);


  }

  configureRouter(config: RouterConfiguration, router: Router) {

    config.map([
      { route: '', name: 'audit', moduleId: './audit' }
    ]);
    this.router = router;
  }
  async activate(params){
    let transfer = await this.cargoownershipTransferService.getDetail(params.id);
    Object.assign(this.transfer ,transfer);

  }

}