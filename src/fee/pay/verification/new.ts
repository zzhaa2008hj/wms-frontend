import { DialogController } from "ui";
import { inject, newInstance } from "aurelia-dependency-injection";
import { ValidationController } from "aurelia-validation";
import { formValidationRenderer } from "@app/validation/support";
import { Verification, verificationValidationRules } from "@app/fee/models/verification";
import { Invoice } from "@app/fee/models/invoice";
import { DialogService } from "ui";

export class VerificationNew {
  verification = {} as Verification;
  invoice = {} as Invoice;
  constructor(@inject private dialogController: DialogController,
              @newInstance() private validationController: ValidationController,
              @inject private dialogService: DialogService) {
    this.validationController.addRenderer(formValidationRenderer);
  }

  activate(invoice: Invoice) {
    this.invoice = invoice;
    this.verification.infoId = invoice.infoId;
    this.verification.invoiceId = invoice.id;
    this.verification.feeType = invoice.feeType;
    this.validationController.addObject(this.verification, verificationValidationRules);
  }

  async save() {
    let { valid } = await this.validationController.validate();
    if (!valid) return;
    let v = (this.invoice.amount * 100 - this.invoice.verificationAmount * 100) / 100;
    if (this.verification.amount > v) {
      await this.dialogService.alert({ title: "提示", message: '核销数量已超过发票金额', icon: "error" });
    }else {
      await this.dialogController.ok(this.verification);
    }
  }

  async cancel() {
    await this.dialogController.cancel();
  }

}