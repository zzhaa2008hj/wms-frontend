import { autoinject, Container } from "aurelia-dependency-injection";
import { DialogController } from "ui";
import { CargoCategory } from "@app/base/models/cargo-category";
import { ValidationController, ValidationControllerFactory, ValidationRules } from 'aurelia-validation';
import { formValidationRenderer } from "@app/validation/support";
/**
 * Created by Hui on 2017/6/14.
 */
@autoinject
export class NewCargoCategory {
  cargoCategory: CargoCategory;
  pCargoCategory: CargoCategory;
  validationController: ValidationController;

  constructor(private dialogController: DialogController,
              validationControllerFactory: ValidationControllerFactory, container: Container) {
    this.validationController = validationControllerFactory.create();
    this.validationController.addRenderer(formValidationRenderer);
    container.registerInstance(ValidationController, this.validationController);
  }

  activate(cargoCategory: CargoCategory) {
    this.pCargoCategory = cargoCategory;
  }


  async save() {
    if (this.pCargoCategory) {
      this.cargoCategory.parentId = this.pCargoCategory.id;
    }

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

  .ensure((cargoCategory: CargoCategory) => cargoCategory.specs)
  .displayName('规格')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((cargoCategory: CargoCategory) => cargoCategory.sort)
  .displayName('排序')
  .satisfies(x => /^[0-9]*$/.test(x)).withMessage(`\${$displayName} 请输入阿拉伯数字`)

  .ensure((cargoCategory: CargoCategory) => cargoCategory.remark)
  .displayName('描述')
  .maxLength(500).withMessage(`\${$displayName} 过长`)
  .rules;