import { autoinject, Container } from "aurelia-dependency-injection";
import { DialogController } from "ui";
import { Warehouse } from "@app/base/models/warehouse";
import { ValidationController, ValidationControllerFactory, ValidationRules } from 'aurelia-validation';
import { formValidationRenderer } from "@app/validation/support";
import { DictionaryData } from "@app/base/models/dictionary";
import { DictionaryDataService } from "@app/base/services/dictionary";
/**
 * Created by Hui on 2017/6/14.
 */
@autoinject
export class EditWarehouse {
  warehouse: Warehouse;
  validationController: ValidationController;
  type = [] as DictionaryData[];
  category = [] as DictionaryData[];
  constructor(private dialogController: DialogController,
              private dictionaryDataService: DictionaryDataService,
              validationControllerFactory: ValidationControllerFactory, container: Container) {
    this.validationController = validationControllerFactory.create();
    this.validationController.addRenderer(formValidationRenderer);
    container.registerInstance(ValidationController, this.validationController);

  }

  async activate(warehouse: Warehouse) {
    this.warehouse = warehouse;
    this.type = await this.dictionaryDataService.getDictionaryDatas("warehouseType");
    this.category = await this.dictionaryDataService.getDictionaryDatas("warehouseCategory");
    console.log(this.warehouse);
  }

  async save() {
    this.validationController.addObject(this.warehouse, validationRules);
    let { valid } = await this.validationController.validate();
    if (!valid) return;

    await this.dialogController.ok(this.warehouse);
  }

  async cancel() {
    await this.dialogController.cancel();
  }

}

const validationRules = ValidationRules
  .ensure((warehouse: Warehouse) => warehouse.name)
  .displayName('库区名称')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((warehouse: Warehouse) => warehouse.remark)
  .displayName('备注')
  .maxLength(500).withMessage(`\${$displayName} 过长`)
  .rules;