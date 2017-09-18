import { autoinject, Container } from "aurelia-dependency-injection";
import { DialogController, DialogService } from "ui";
import { ValidationController, ValidationControllerFactory, ValidationRules } from 'aurelia-validation';
import { formValidationRenderer } from "@app/validation/support";
import { PaymentInfoService } from "@app/fee/services/pay";
import { PaymentInfo, PaymentAuditItem } from "@app/fee/models/pay";
import * as moment from 'moment';
import { NewAutoPaymentInfo } from '@app/fee/pay/new-item';
import { DictionaryDataService } from '@app/base/services/dictionary';
import { DictionaryData } from '@app/base/models/dictionary';
import { Router } from "aurelia-router";

@autoinject
export class NewPaymentInfo {

  disabled = false;
  validationController: ValidationController;
  paymentInfo = {} as PaymentInfo;
  customerDrop: kendo.ui.DropDownList;
  endDatePicker: kendo.ui.DatePicker;
  customersSource = new kendo.data.DataSource({
    transport: {
      read: options => {
        this.paymentInfoService.listCustomersForWork()
          .then(options.success)
          .catch(err => options.error("", "", err));
      }
    }
  });
  // 自动
  items: PaymentAuditItem[] = [];
  // 手动
  manualItems: PaymentAuditItem[] = [];
  units: DictionaryData[];
  itemDataSource = new kendo.data.DataSource({
    transport: {
      read: options => {
        options.success(this.items);
      }
    }
  });
  constructor(private paymentInfoService: PaymentInfoService,
              private dialogController: DialogController,
              private dictionaryDataService: DictionaryDataService,
              private router: Router,
              validationControllerFactory: ValidationControllerFactory,
              container: Container,
              private dialogService: DialogService) {
    this.validationController = validationControllerFactory.create();
    this.validationController.addRenderer(formValidationRenderer);
    container.registerInstance(ValidationController, this.validationController);
  }

  async activate() {
    this.validationController.addObject(this.paymentInfo, validationRules);
    this.paymentInfo.type = 1;
    this.units = await this.dictionaryDataService.getDictionaryDatas("unit");
  }
  /**
   * 获取开始时间
   */
  async getChargeStartDate() {
    let { chargeStartDate } = await this.paymentInfoService.getChargeStartDate(this.paymentInfo.customerId);
    this.paymentInfo.chargeStartDateStr = moment(chargeStartDate).format("YYYY-MM-DD");
    this.paymentInfo.chargeStartDate = chargeStartDate;

    this.endDatePicker.min(new Date(this.paymentInfo.chargeStartDate));
    this.endDatePicker.max(new Date());
  }
  /**
   * 获取明细
   */
  async getItems() {
    if (!this.paymentInfo.chargeStartDateStr) {
      this.dialogService.alert({ title: "提示", message: '请选择装卸单位', icon: "error" });
      this.endDatePicker.value(null);
      return;
    }
    let endDate = moment(this.endDatePicker.value()).format("YYYY-MM-DD");
    let items = await this.paymentInfoService.getItems(this.paymentInfo.customerId, endDate);
    items.forEach(item => {
      item.workDate = new Date(item.workDate);
      let u = this.units.find(u => u.dictDataCode == item.unit);
      if (u) {
        item.unitStr = u.dictDataName;
      }
      item.type = 1;
    });
    // 添加
    this.items = [];
    // 手动有数据
    if (this.manualItems.length > 0) {
      this.items = this.items.concat(this.manualItems);
    }
    this.items = this.items.concat(items);
    this.itemDataSource.read();
  }
  /**
   * 手动新增明细
   */
  async addItem() {
    let result = await this.dialogService.open({ viewModel: NewAutoPaymentInfo, lock: true }).whenClosed();
    if (result.wasCancelled) return;
    this.manualItems.push(result.output);
    this.items.push(result.output);
    this.itemDataSource.read();
  }

  removeItem() {
    this.manualItems = [];
    this.items = [];
    this.itemDataSource.read();
  }
  /**
   * 保存
   */
  async save() {
    this.validationController.addObject(this.paymentInfo, validationRules);
    let { valid } = await this.validationController.validate();
    if (!valid) return;
    this.paymentInfo.customerName = this.customerDrop.text();
    this.paymentInfo.paymentAuditItemList = this.items;

    try {
      this.disabled = true;
      console.log(this.paymentInfo);
      await this.paymentInfoService.savePaymentInfo(this.paymentInfo);
      await this.dialogService.alert({ title: "提示", message: "新增成功！" });
      this.router.navigateToRoute("list");
    } catch (err) {
      await this.dialogService.alert({ title: "提示", message: err.message, icon: "error" });
      this.disabled = false;
    }
  }

  cancel() {
    this.router.navigateToRoute("list");
  }

}

const validationRules = ValidationRules
  .ensure((paymentInfo: PaymentInfo) => paymentInfo.customerId)
  .displayName("装卸单位名称")
  .required().withMessage(`\${$displayName}不能为空`)

  .ensure((paymentInfo: PaymentInfo) => paymentInfo.chargeEndDate)
  .displayName("结算结束日期")
  .required().withMessage(`\${$displayName}不能为空`)

  .ensure((paymentInfo: PaymentInfo) => paymentInfo.type)
  .displayName("结算生成方式")
  .required().withMessage(`\${$displayName}不能为空`)

  .ensure((paymentInfo: PaymentInfo) => paymentInfo.remark)
  .displayName("备注")
  .maxLength(200).withMessage(`\${$displayName}最大长度为200`)

  // .ensure((paymentInfo: PaymentInfo) => paymentInfo.payableAmount)
  // .displayName("费用合计")
  // .required().withMessage(`\${$displayName}不能为空`)
  // .matches(/^([+]?\d{1,10})(\.\d{1,2})?$/).withMessage(`\${$displayName}小数点不能超过2位`)
  .rules;
