import { autoinject, Container } from "aurelia-dependency-injection";
import { DialogController } from "ui";
import { ValidationController, ValidationControllerFactory, ValidationRules } from 'aurelia-validation';
import { formValidationRenderer } from "@app/validation/support";
import { PaymentInfoService } from "@app/fee/services/pay";
import { PaymentInfo } from "@app/fee/models/pay";

@autoinject
export class EditPaymentInfo {

  validationController: ValidationController;
  paymentInfo = {} as PaymentInfo;

  constructor(private paymentInfoService: PaymentInfoService,
    private dialogController: DialogController,
    validationControllerFactory: ValidationControllerFactory,
    container: Container) {
    this.validationController = validationControllerFactory.create();
    this.validationController.addRenderer(formValidationRenderer);
    container.registerInstance(ValidationController, this.validationController);

  }

  async activate(id) {
    this.paymentInfo = await this.paymentInfoService.getPaymentInfoById(id);
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
.ensure((paymentInfo: PaymentInfo) => paymentInfo.customerId)
.displayName("装卸单位名称")
.required().withMessage(`\${$displayName}不能为空`)

.ensure((paymentInfo: PaymentInfo) => paymentInfo.type)
.displayName("结算生成方式")
.required().withMessage(`\${$displayName}不能为空`)

.ensure((paymentInfo: PaymentInfo) => paymentInfo.remark)
.displayName("备注")
.maxLength(200).withMessage(`\${$displayName}最大长度为200`)

.ensure((paymentInfo: PaymentInfo) => paymentInfo.payableAmount)
.displayName("费用合计")
.required().withMessage(`\${$displayName}不能为空`)
.matches(/^([+]?\d{1,10})(\.\d{1,2})?$/).withMessage(`\${$displayName}小数点不能超过2位`)
.rules;
