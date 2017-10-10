import { autoinject } from 'aurelia-framework';
import { CargoMortgage } from '@app/cargo-mortgage/models/cargo-mortgage';
import { DialogController } from 'ui';

@autoinject
export class CancelMortgage {

  cargoMortgage= {} as CargoMortgage;

  constructor(private dialogController: DialogController) {

  }

  activate(cargoMortgage: CargoMortgage) {
    this.cargoMortgage = cargoMortgage;
  }

  async save() {
    await this.dialogController.ok(this.cargoMortgage);
  }

  async cancel() {
    await this.dialogController.cancel();
  }
}