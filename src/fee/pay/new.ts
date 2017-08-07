import { autoinject, Container } from "aurelia-dependency-injection";
import { DialogController } from "ui";
import { ValidationController, ValidationControllerFactory, ValidationRules } from 'aurelia-validation';
import { formValidationRenderer } from "@app/validation/support";
import { PaymentInfoService } from "@app/fee/services/pay";
import { PaymentInfo } from "@app/fee/models/pay";
import * as moment from 'moment';

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

  constructor(private paymentInfoService: PaymentInfoService,
    private dialogController: DialogController,
    validationControllerFactory: ValidationControllerFactory,
    container: Container) {
    this.validationController = validationControllerFactory.create();
    this.validationController.addRenderer(formValidationRenderer);
    container.registerInstance(ValidationController, this.validationController);

  }

  async activate() {
    this.validationController.addObject(this.paymentInfo, validationRules);
    this.paymentInfo.type = 1;
  }

  async validateWorkOrderItem(propertyName: string) {
    if (this.paymentInfo.type == 1) {
      this.endDatePicker.value(null)
    }
    this.paymentInfo.chargeEndDate = null;
    this.paymentInfo.chargeStartDate = null;
    this.paymentInfo.chargeStartDateStr = null;
    if (!this.paymentInfo.customerId) {
      this.endDatePicker.enable(false);
    } else {
      if (this.paymentInfo.type == 1) {
        let { chargeStartDate } = await this.paymentInfoService.getChargeStartDate(this.paymentInfo.customerId);
        this.paymentInfo.chargeStartDateStr = moment(chargeStartDate).format("YYYY-MM-DD");
        this.paymentInfo.chargeStartDate = chargeStartDate;
        this.startChange();
        this.endDatePicker.enable(true);
      }
    }
    this.validationController.validate({ object: this.paymentInfo, propertyName });
  }

  async save() {
    this.validationController.addObject(this.paymentInfo, validationRules);
    let { valid } = await this.validationController.validate();
    if (!valid) return;
    this.paymentInfo.customerName = this.customerDrop.text();
    await this.dialogController.ok(this.paymentInfo);
  }
  typeChange() {
    if (this.paymentInfo.type == 1) {
      this.endDatePicker.value(null)
    }
    this.paymentInfo.chargeEndDate = null;
    this.paymentInfo.chargeStartDate = null;
    this.paymentInfo.chargeStartDateStr = null;
    this.paymentInfo.customerId = null;
  }

  startChange() {
    let startDate = this.paymentInfo.chargeStartDate;
    startDate = new Date(startDate);
    startDate.setDate(startDate.getDate() + 1);
    this.endDatePicker.min(startDate);
  }

  async cancel() {
    await this.dialogController.cancel();
  }

}

const validationRules = ValidationRules
  .ensure((paymentInfo: PaymentInfo) => paymentInfo.customerId)
  .displayName("装卸单位名称")
  .required().withMessage(`\${$displayName}不能为空`)

  .ensure((paymentInfo: PaymentInfo) => paymentInfo.chargeEndDate)
  .displayName("结算结束日期")
  .satisfies((chargeEndDate, paymentInfo) => { if (paymentInfo.type == 1) { if (!chargeEndDate) { return false } } return true }).withMessage(`\${$displayName}不能为空`)

  .ensure((paymentInfo: PaymentInfo) => paymentInfo.type)
  .displayName("结算生成方式")
  .required().withMessage(`\${$displayName}不能为空`)

  .ensure((paymentInfo: PaymentInfo) => paymentInfo.remark)
  .displayName("备注")
  .maxLength(200).withMessage(`\${$displayName}最大长度为200`)

  .ensure((paymentInfo: PaymentInfo) => paymentInfo.sumFee)
  .displayName("费用合计")
  .satisfies((sumFee, paymentInfo) => {
    if(paymentInfo.type ==1){
      return true;
    }else{
      return !!sumFee || (sumFee <= 1000000000000000 && sumFee > 0)
    }
  })
  .withMessage(`\${$displayName} 为无效值(过大或过小)`)
  .rules;
