import { DialogController } from "ui";
import { autoinject, Container } from "aurelia-dependency-injection";
import { ChargeAuditList, chargeAuditListValidationRules } from "@app/fee/models/charge-audit";
import { ValidationController, ValidationControllerFactory } from "aurelia-validation";
import { formValidationRenderer } from "@app/validation/support";

@autoinject
export class InvoiceEntry {
  chargeAuditList = {} as ChargeAuditList;
  validationController: ValidationController;

  constructor(private dialogController: DialogController,
              validationControllerFactory: ValidationControllerFactory,
              container: Container) {
    this.chargeAuditList.invoiceType = 1;
    this.validationController = validationControllerFactory.create();
    this.validationController.addRenderer(formValidationRenderer);
    container.registerInstance(ValidationController, this.validationController);
  }

  activate() {
    this.validationController.addObject(this.chargeAuditList, chargeAuditListValidationRules);
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