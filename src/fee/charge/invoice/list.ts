import { inject } from "aurelia-dependency-injection";
import { DialogService } from "ui";
import { InvoiceService } from "@app/fee/services/invoice";
import { Invoice } from '@app/fee/models/invoice';
import { Router } from "aurelia-router";
import { VerificationView } from '@app/fee/charge/invoice/view';

export class InvoiceList {
  invoice: Invoice[] = [];
  infoId: string;
  dataSource: kendo.data.DataSource;
  constructor(@inject private invoiceService: InvoiceService,
              @inject private dialogService: DialogService,
              @inject private router: Router,
              @inject('chargeInvoice') private info: Invoice) {
  }

  async activate() {
    this.infoId = this.info.infoId;
    this.dataSource = new kendo.data.DataSource({
      transport: {
        read: async (options) => {
          options.success(await this.invoiceService.getInvoices(this.infoId, 1).then(
            res => res.map(r => {
              if (!r.verificationAmount) {
                r.verificationAmount = 0;
              }
              r.unverificationAmount = r.amount - r.verificationAmount;
              return r;
            })
          ));
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
    this.router.navigateToRoute("charge");
  }
}
