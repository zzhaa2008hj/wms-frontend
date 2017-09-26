import { CargoownershipTransfer } from "@app/cargo-ownership/models/cargo-ownership";
import { CargoownershipTransferService } from "@app/cargo-ownership/services/cargo-ownership";
import { inject } from "aurelia-dependency-injection";

export  class Audit{
  id : string ;
  stage ;
  constructor(@inject private  cargoownershipTransferService : CargoownershipTransferService,
              @inject('transferInfo') private transfer : CargoownershipTransfer ){}

  async activate(params){
    this.id = this.transfer.id ;
    this.stage = params.stage ;
  }

  async doAudit(status){
    await  this.cargoownershipTransferService.doAudit(this.id,status ,this.stage)
  }




}



