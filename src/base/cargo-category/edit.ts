import { autoinject, Container } from "aurelia-dependency-injection";
import { DialogController } from "ui";
import { CargoCategory } from "@app/base/models/cargo-category";
import { ValidationController, ValidationControllerFactory, ValidationRules } from 'aurelia-validation';
import { formValidationRenderer } from "@app/validation/support";
/**
 * Created by Hui on 2017/6/14.
 */
@autoinject
export class EditCargoCategory {
  cargoCategory: CargoCategory = {} as CargoCategory;
  validationController: ValidationController;

  constructor(private dialogController: DialogController,
              validationControllerFactory: ValidationControllerFactory, container: Container) {
    this.validationController = validationControllerFactory.create();
    this.validationController.addRenderer(formValidationRenderer);
    container.registerInstance(ValidationController, this.validationController);
  }

  activate(cargoCategory: CargoCategory) {
    this.cargoCategory = cargoCategory;
  }

  async save() {
    this.validationController.addObject(this.cargoCategory, validationRules);
    let { valid } = await this.validationController.validate();
    if (!valid) return;

    await this.dialogController.ok(this.cargoCategory);
  }

  async cancel() {
    await this.dialogController.cancel();
  }

}

const validationRules = ValidationRules
  .ensure((cargoCategory: CargoCategory) => cargoCategory.categoryName)
  .displayName('种类/品牌名称')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((cargoCategory: CargoCategory) => cargoCategory.remark)
  .displayName('描述')
  .maxLength(500).withMessage(`\${$displayName} 过长`)
  .rules;