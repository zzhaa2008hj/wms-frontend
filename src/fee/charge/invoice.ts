import { DialogController } from "ui";
import { autoinject } from "aurelia-dependency-injection";
import { Invoice } from "@app/fee/models/invoice";

@autoinject
export class InvoiceEntry {
  invoice = {} as { invoiceType: number, invoiceNumber: string };

  constructor(private dialogController: DialogController) {
    this.invoice.invoiceType = 1;
  }

  async save() {
    await this.dialogController.ok(this.invoice);
  }

  async cancel() {
    await this.dialogController.cancel();
  }

}