import { autoinject, Container } from "aurelia-dependency-injection";
import { DialogController } from "ui";
import { ValidationController, ValidationControllerFactory, ValidationRules } from 'aurelia-validation';
import { formValidationRenderer } from "@app/validation/support";
import { PaymentInfoService } from "@app/fee/services/pay";
import { PaymentInfo } from "@app/fee/models/pay";
import * as moment from 'moment';

@autoinject
export class EditPaymentInfo {

  validationController: ValidationController;
  paymentInfo = {} as PaymentInfo;
  endDatePicker: kendo.ui.DatePicker;
  constructor(private paymentInfoService: PaymentInfoService,
    private dialogController: DialogController,
    validationControllerFactory: ValidationControllerFactory,
    container: Container) {
    this.validationController = validationControllerFactory.create();
    this.validationController.addRenderer(formValidationRenderer);
    container.registerInstance(ValidationController, this.validationController);

  }

  async activate(id) {
    this.validationController.addObject(this.paymentInfo, validationRules);
    this.paymentInfo = await this.paymentInfoService.getPaymentInfoById(id);
    this.paymentInfo.chargeStartDateStr = moment(this.paymentInfo.chargeStartDate).format("YYYY-MM-DD");
    if (this.paymentInfo.type == 2) {
      let { sumFee } = await this.paymentInfoService.getPaymentAuditFee(this.paymentInfo.id);
      this.paymentInfo.sumFee = sumFee;
    }

  }

  onOpen() {
    let startDate = this.paymentInfo.chargeStartDate;
    startDate = new Date(startDate);
    startDate.setDate(startDate.getDate() + 1);
    this.endDatePicker.min(startDate);
    this.endDatePicker.min(startDate);
  }

  async save() {
    this.validationController.addObject(this.paymentInfo, validationRules);
    let { valid } = await this.validationController.validate();
    if (!valid) return;
    await this.dialogController.ok(this.paymentInfo);
  }

  async cancel() {
    await this.dialogController.cancel();
  }

}

const validationRules = ValidationRules
  .ensure((paymentInfo: PaymentInfo) => paymentInfo.chargeEndDate)
  .displayName("结算结束日期")
  .satisfies((chargeEndDate, paymentInfo) => {
    if (paymentInfo.type == 1) {
      if (!chargeEndDate) {
        return false
      }
    }
    return true
  }).withMessage(`\${$displayName}不能为空`)

  .ensure((paymentInfo: PaymentInfo) => paymentInfo.remark)
  .displayName("备注")
  .maxLength(200).withMessage(`\${$displayName}最大长度为200`)

  .ensure((paymentInfo: PaymentInfo) => paymentInfo.sumFee)
  .displayName("费用合计")
  .satisfies((sumFee, paymentInfo) => {
    if (!paymentInfo.type || paymentInfo.type == 1) {
      return true;
    }
    return !!sumFee || (sumFee <= 1000000000000000 && sumFee > 0)

  })
  .withMessage(`\${$displayName} 为无效值(过大或过小)`)
  .rules;
