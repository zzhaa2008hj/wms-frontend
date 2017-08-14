import { autoinject, Container } from "aurelia-dependency-injection";
import { DialogController } from "ui";
import { ValidationController, ValidationControllerFactory } from 'aurelia-validation';
import { formValidationRenderer } from "@app/validation/support";
import { vehicleValidationRules } from "@app/outstock/models/order";
import { InstockVehicle } from "@app/instock/models/instock-vehicle";
/**
 * Created by Hui on 2017/6/14.
 */
@autoinject
export class NewVehicle {
  vehicle = {} as InstockVehicle;
  validationController: ValidationController;

  constructor(private dialogController: DialogController,
              validationControllerFactory: ValidationControllerFactory, container: Container) {
    this.validationController = validationControllerFactory.create();
    this.validationController.addRenderer(formValidationRenderer);
    container.registerInstance(ValidationController, this.validationController);
  }

  activate(cargoItem: any) {
    Object.assign(this.vehicle, cargoItem);
    this.vehicle.remark = null;
    if (cargoItem.id) {
      this.vehicle.instockGoodsId = cargoItem.id;
      this.vehicle.id = null;
    }
  }

  async save() {
    this.validationController.addObject(this.vehicle, vehicleValidationRules);
    let { valid } = await this.validationController.validate();
    if (!valid) return;
    await this.dialogController.ok(this.vehicle);
  }

  async cancel() {
    await this.dialogController.cancel();
  }
}
