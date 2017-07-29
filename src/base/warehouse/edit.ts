import { observable } from 'aurelia-binding';
import { autoinject, Container } from "aurelia-dependency-injection";
import { DialogController, MessageDialogService } from 'ui';
import { Warehouse } from "@app/base/models/warehouse";
import { ValidationController, ValidationControllerFactory, ValidationRules } from 'aurelia-validation';
import { formValidationRenderer } from "@app/validation/support";
import { DictionaryDataService } from '@app/base/services/dictionary';
import { DictionaryData } from '@app/base/models/dictionary';
/**
 * Created by Hui on 2017/6/14.
 */
@autoinject
export class EditWarehouse {
  oldWarehouse = {} as Warehouse;
  warehouse: Warehouse = {} as Warehouse;
  @observable
  hasParentId: boolean = false;
  type = [] as DictionaryData[];
  category = [] as DictionaryData[];
  validationController: ValidationController;

  constructor(private dialogController: DialogController,
              private messageDialogService: MessageDialogService,
              private dictionaryDataService: DictionaryDataService,
              validationControllerFactory: ValidationControllerFactory,
              container: Container) {
    this.validationController = validationControllerFactory.create();
    this.validationController.addRenderer(formValidationRenderer);
    container.registerInstance(ValidationController, this.validationController);

  }

  async activate(warehouse: Warehouse) {
    this.type = await this.dictionaryDataService.getDictionaryDatas("warehouseType");
    this.category = await this.dictionaryDataService.getDictionaryDatas("warehouseCategory");
    Object.assign(this.oldWarehouse, warehouse);
    this.warehouse = warehouse;
    if (this.warehouse.parentId) {
      this.hasParentId = true;
    }
  }

  async save() {
    this.validationController.addObject(this.warehouse, validationRules);
    let { valid } = await this.validationController.validate();
    if (!valid) return;

    if (this.oldWarehouse.category != this.warehouse.category || this.oldWarehouse.type != this.warehouse.type) {
      let confirmed = await this.messageDialogService.confirm({ title: "提示:", message: "修改后子集性质与类别将同步修改，确认吗？" });
      if (confirmed) {
        await this.dialogController.ok(this.warehouse);
      } else {
        return;
      }
    } else {
      await this.dialogController.ok(this.warehouse);
    }
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