import { RouterConfiguration, Router } from "aurelia-router";
import { autoinject, Container } from 'aurelia-dependency-injection';
import { CargoownershipTransfer } from "src/cargo-ownership/models/cargo-ownership";
import { CargoownershipTransferService } from "@app/cargo-ownership/services/cargo-ownership";

@autoinject
export class Audit {

  router: Router;

  private transfer = {} as CargoownershipTransfer ;

  constructor(private container: Container,
              private  cargoownershipTransferService : CargoownershipTransferService){
    this.container.registerInstance("transferInfo",this.transfer);


  }

  configureRouter(config: RouterConfiguration, router: Router) {

    config.map([
      { route: '', name: 'business', moduleId: './business' },
      { route: '/charge', name: 'charge', moduleId: './charge' },
      { route: '/manager', name: 'manager', moduleId: './manager' },
    ]);
    this.router = router;
  }
  async activate(params){
    let transfer = await this.cargoownershipTransferService.queryById(params.id);
    Object.assign(this.transfer ,transfer);

  }

}