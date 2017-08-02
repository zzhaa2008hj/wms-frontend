import { DialogController } from "ui";
import { autoinject } from "aurelia-dependency-injection";
import { Invoice } from "@app/fee/models/invoice";
@autoinject
export class InvoiceEntry {
  invoice = {} as Invoice;

  constructor(private dialogController: DialogController) {
  }

  async save() {
    await this.dialogController.ok(this.invoice);
  }

  async cancel() {
    await this.dialogController.cancel();
  }

}