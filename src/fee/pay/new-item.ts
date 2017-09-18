import { autoinject, Container } from "aurelia-dependency-injection";
import { DialogController, DialogService } from "ui";
import { ValidationController, ValidationControllerFactory, ValidationRules } from 'aurelia-validation';
import { formValidationRenderer } from "@app/validation/support";
import { PaymentAuditItem } from "@app/fee/models/pay";
import { DictionaryDataService } from '@app/base/services/dictionary';
import { CargoCategoryTree } from '@app/fee/pay/cargo-category-tree';
import { WarehouseService } from '@app/base/services/warehouse';

@autoinject
export class NewAutoPaymentInfo {

  validationController: ValidationController;
  paymentAuditItem = {} as PaymentAuditItem;
  warehouseDrop: kendo.ui.DropDownList;
  unitDrop: kendo.ui.DropDownList;
  endDatePicker: kendo.ui.DatePicker;
  unitSource: any;
  warehouseSource: any;
  constructor(private dialogController: DialogController,
              private dialogService: DialogService,
              private dictionaryDataService: DictionaryDataService,
              private warehouseService: WarehouseService,
              validationControllerFactory: ValidationControllerFactory,
              container: Container) {
    this.validationController = validationControllerFactory.create();
    this.validationController.addRenderer(formValidationRenderer);
    container.registerInstance(ValidationController, this.validationController);
  }

  async activate() {
    this.validationController.addObject(this.paymentAuditItem, validationRules);
    this.unitSource = await this.dictionaryDataService.getDictionaryDatas("unit");
    this.warehouseSource = await this.warehouseService.listWarehouse({status: true});
  }

  async selectCargoCategory() {
    let result = await this.dialogService.open({ viewModel: CargoCategoryTree, model: null, lock: true }).whenClosed();
    if (result.wasCancelled) return;
    let cargoCategory = result.output;
    this.paymentAuditItem.cargoCategoryName = cargoCategory.categoryName;
    this.paymentAuditItem.cargoCategoryId = cargoCategory.id;
    // 明细手动模式
    this.paymentAuditItem.type = 2;
  }

  async save() {
    this.paymentAuditItem.warehouseName = this.warehouseDrop.text();
    this.paymentAuditItem.unitStr = this.unitDrop.text();
    this.paymentAuditItem.sumAmount = (this.paymentAuditItem.price * 100) * (this.paymentAuditItem.workNumber * 100) / 10000;
    let { valid } = await this.validationController.validate();
    if (!valid) return;
    await this.dialogController.ok(this.paymentAuditItem);
  }

  async cancel() {
    await this.dialogController.cancel();
  }

}

const validationRules = ValidationRules
  .ensure((item: PaymentAuditItem) => item.workDate)
  .displayName("作业日期")
  .required().withMessage(`\${$displayName}不能为空`)

  .ensure((item: PaymentAuditItem) => item.workName)
  .displayName("作业内容")
  .required().withMessage(`\${$displayName}不能为空`)

  .ensure((item: PaymentAuditItem) => item.cargoName)
  .displayName("货名")
  .required().withMessage(`\${$displayName}不能为空`)

  .ensure((item: PaymentAuditItem) => item.cargoCategoryId)
  .displayName("货类")
  .required().withMessage(`\${$displayName}不能为空`)

  .ensure((item: PaymentAuditItem) => item.warehouseId)
  .displayName("库区")
  .required().withMessage(`\${$displayName}不能为空`)

  .ensure((item: PaymentAuditItem) => item.cargoCategoryName)
  .displayName("货类")
  .required().withMessage(`\${$displayName}不能为空`)

  .ensure((item: PaymentAuditItem) => item.unit)
  .displayName("计量单位")
  .required().withMessage(`\${$displayName}不能为空`)

  .ensure((item: PaymentAuditItem) => item.workNumber)
  .displayName("作业数量")
  .required().withMessage(`\${$displayName}不能为空`)
  .matches(/^([+]?\d{1,10})(\.\d{1,2})?$/).withMessage(`\${$displayName}小数点不能超过2位`)

  .ensure((item: PaymentAuditItem) => item.price)
  .displayName("单价")
  .required().withMessage(`\${$displayName}不能为空`)
  .matches(/^([+]?\d{1,10})(\.\d{1,2})?$/).withMessage(`\${$displayName}小数点不能超过2位`)

  .ensure((item: PaymentAuditItem) => item.remark)
  .displayName("备注")
  .maxLength(200).withMessage(`\${$displayName}最大长度为200`)
  .rules;
