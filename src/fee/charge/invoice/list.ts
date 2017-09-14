import { inject } from "aurelia-dependency-injection";
import { DialogService } from "ui";
import { InvoiceService } from "@app/fee/services/invoice";
import { InvoiceNew } from '@app/fee/charge/invoice/new';
import { Invoice } from '@app/fee/models/invoice';
import { Router } from "aurelia-router";


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
          options.success(await this.invoiceService.getInvoices(this.infoId, 1));
        }
      }
    });
  }

  async add() {
    let result = await this.dialogService.open({ viewModel: InvoiceNew, model: {infoId: this.infoId}, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
    try {
      await this.invoiceService.saveInvoice(result.output);
      await this.dialogService.alert({ title: "提示", message: "新增成功！" });
      this.dataSource.read();
    } catch (err) {
      await this.dialogService.alert({ title: "提示", message: err.message, icon: "error" });
    }
  }

  async delete(id) {
    try {
      let confirm = await this.dialogService.confirm({ title: "提示", message: "删除后无法恢复，确定要删除？" });
      if (confirm) {
        await this.invoiceService.deleteInvoice(id);
        await this.dialogService.alert({ title: "提示", message: "新增成功！" });
        this.dataSource.read();
      }
    } catch (err) {
      await this.dialogService.alert({ title: "提示", message: err.message, icon: 'error' });
    }
  }

  cancel() {
    this.router.navigateToRoute("charge");
  }
}
