import { inject } from "aurelia-dependency-injection";
import { DialogService } from "ui";
import { VerificationService } from "@app/fee/services/verification";
import { InvoiceService } from "@app/fee/services/invoice";
import { VerificationNew } from '@app/fee/pay/verification/new';
import { Invoice } from '@app/fee/models/invoice';
import { Router } from "aurelia-router";
import { VerificationView } from '@app/fee/pay/verification/view';


export class InvoiceList {
  invoice: Invoice[] = [];
  infoId: string;
  dataSource: kendo.data.DataSource;
  constructor(@inject private invoiceService: InvoiceService,
              @inject private verificationService: VerificationService,
              @inject private dialogService: DialogService,
              @inject private router: Router,
              @inject('payVerification') private info: Invoice) {
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

  async add(invoice) {
    let result = await this.dialogService.open({ viewModel: VerificationNew, model: invoice, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
    try {
      await this.verificationService.saveVerification(result.output);
      await this.dialogService.alert({ title: "提示", message: "新增成功！" });
      this.dataSource.read();
    } catch (err) {
      await this.dialogService.alert({ title: "提示", message: err.message, icon: "error" });
    }
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
