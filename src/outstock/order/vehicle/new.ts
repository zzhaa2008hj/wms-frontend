import { autoinject, Container } from "aurelia-dependency-injection";
import { DialogController } from "ui";
import { Vehicle } from "@app/instock/models/cargo-flow";
import { ValidationController, ValidationControllerFactory, ValidationRules } from 'aurelia-validation';
import { formValidationRenderer } from "@app/validation/support";
/**
 * Created by Hui on 2017/7/11.
 */
@autoinject
export class NewVehicle {
  vehicle = {} as Vehicle;
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
    this.validationController.addObject(this.vehicle, validationRules);
    let { valid } = await this.validationController.validate();
    if (!valid) return;
    await this.dialogController.ok(this.vehicle);
  }

  async cancel() {
    await this.dialogController.cancel();
  }
}

const validationRules = ValidationRules
  .ensure((vehicle: Vehicle) => vehicle.plateNumber)
  .displayName('车牌号')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((vehicle: Vehicle) => vehicle.driverName)
  .displayName('司机名称')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((vehicle: Vehicle) => vehicle.driverIdentityNumber)
  .displayName('身份证号')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((vehicle: Vehicle) => vehicle.phoneNumber)
  .displayName('电话')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((vehicle: Vehicle) => vehicle.remark)
  .displayName('备注')
  .maxLength(500).withMessage(`\${$displayName} 过长`)
  .rules;