import { DialogController } from "ui";
import { autoinject } from "aurelia-dependency-injection";
import { ChargeAuditList, chargeAuditListValidationRules } from "@app/fee/models/charge-audit";
import { ValidationController, ValidationControllerFactory } from "aurelia-validation";
import { formValidationRenderer } from "@app/validation/support";

@autoinject
export class InvoiceEntry {
  chargeAuditList = {} as ChargeAuditList;

  constructor(private dialogController: DialogController,
              private validationControllerFactory: ValidationControllerFactory) {
    this.chargeAuditList.invoiceType = 1;
    this.validationController = this.validationControllerFactory.create();
    this.validationController.addRenderer(formValidationRenderer);
    this.container.registerInstance(ValidationController, this.validationController);
  }

  activate() {
    this.validationController.addObject(this.paymentAuditList, chargeAuditListValidationRules);
  }

  async save() {
    let { valid } = await this.validationController.validate();
    if (!valid) return;
    await this.dialogController.ok(this.chargeAuditList);
  }

  async cancel() {
    await this.dialogController.cancel();
  }

}