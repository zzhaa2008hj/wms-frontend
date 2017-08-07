import { DialogController } from "ui";
import { autoinject, Container } from "aurelia-dependency-injection";
import { PaymentAuditList } from "@app/fee/models/pay";
import { ValidationController, ValidationControllerFactory, ValidationRules } from "aurelia-validation";
import { formValidationRenderer } from "@app/validation/support";
@autoinject
export class InvoiceInput {
  paymentAuditList = {} as PaymentAuditList;
  validationController: ValidationController;

  constructor(private dialogController: DialogController,
              private validationControllerFactory: ValidationControllerFactory,
              private container: Container) {
    this.paymentAuditList.invoiceType = 1;
    this.validationController = this.validationControllerFactory.create();
    this.validationController.addRenderer(formValidationRenderer);
    this.container.registerInstance(ValidationController, this.validationController);

  }

  activate() {
    this.validationController.addObject(this.paymentAuditList, validationRules);
  }

  async save() {
    let { valid } = await this.validationController.validate();
    if (!valid) return;
    await this.dialogController.ok(this.paymentAuditList);
  }

  async cancel() {
    await this.dialogController.cancel();
  }

}

const validationRules = ValidationRules
  .ensure((paymentAuditList: PaymentAuditList) => paymentAuditList.invoiceNumber)
  .displayName("发票号不能为空")
  .required().withMessage(`\${$displayName}不能为空`)

  .rules;