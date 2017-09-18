import { DialogController } from "ui";
import { inject, newInstance } from "aurelia-dependency-injection";
import { ValidationController } from "aurelia-validation";
import { formValidationRenderer } from "@app/validation/support";
import { Invoice, invoiceValidationRules } from "@app/fee/models/invoice";


export class InvoiceNew {
  invoice = {} as Invoice;
  constructor(@inject private dialogController: DialogController,
              @newInstance() private validationController: ValidationController) {
    this.validationController.addRenderer(formValidationRenderer);
  }

  activate({infoId}) {
    this.invoice.infoId = infoId;
    this.invoice.feeType = 2;
    this.invoice.invoiceType = 1;
    this.validationController.addObject(this.invoice, invoiceValidationRules);
  }

  async save() {
    let { valid } = await this.validationController.validate();
    if (!valid) return;
    await this.dialogController.ok(this.invoice);
  }

  async cancel() {
    await this.dialogController.cancel();
  }

}