import { inject } from "aurelia-dependency-injection";
import { DialogService } from "ui";
import { InvoiceService } from "@app/fee/services/invoice";
import { Invoice } from '@app/fee/models/invoice';
import { Router } from "aurelia-router";
import { VerificationView } from '@app/fee/pay/invoice/view';
export class InvoiceList {
  invoice: Invoice[] = [];
  infoId: string;
  dataSource: kendo.data.DataSource;
  selection: Invoice[] = [];
  constructor(@inject private invoiceService: InvoiceService,
              @inject private dialogService: DialogService,
              @inject private router: Router,
              @inject('payInvoice') private info: Invoice) {
  }

  async activate() {
    this.infoId = this.info.infoId;
    this.dataSource = new kendo.data.DataSource({
      transport: {
        read: async (options) => {
          options.success(await this.invoiceService.getInvoices(this.infoId, 2));
        }
      }
    });
  }

  async view(invoiceId) {
    await this.dialogService.open({ viewModel: VerificationView, model: {invoiceId: invoiceId}, lock: true })
    .whenClosed();
    this.dataSource.read();
  }

  cancel() {
    this.router.navigateToRoute("pay");
  }
  
}