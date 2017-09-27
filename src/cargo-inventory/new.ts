import { autoinject } from 'aurelia-framework';
import { ConstantValues } from '@app/common/models/constant-values';
import { CargoInventory } from '@app/cargo-inventory/models/cargo-inventoty';


@autoinject
export class NewCargoInventory {

  demandFrom = ConstantValues.DemandFrom;
  cargoInventory = {} as CargoInventory;

  constructor() {
    this.cargoInventory.demandFrom = 1;
  }

  activate() {

  }

  onSelectDemandFrom(e) {
    console.log(e);
    console.log(this.cargoInventory);
  }

  add() {
    
  }
}