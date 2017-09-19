import { inject } from "aurelia-dependency-injection";
import { DialogService } from "ui";
import { VerificationService } from "@app/fee/services/verification";
import { InvoiceService } from "@app/fee/services/invoice";
import { VerificationNew } from '@app/fee/pay/verification/new-verification';
import { Invoice } from '@app/fee/models/invoice';
import { Router } from "aurelia-router";
import { VerificationView } from '@app/fee/pay/verification/view';
import { InvoiceNew } from '@app/fee/pay/verification/new-invoice';
import { PaymentRequisiton } from '@app/fee/pay/payment-requisition';
import { RequisitionOut } from '@app/fee/pay/verification/new-requisition';
export class InvoiceList {
  invoice: Invoice[] = [];
  infoId: string;
  dataSource: kendo.data.DataSource;
  selection: Invoice[] = [];
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
  async addInvoice() {
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

  async deleteInvoice(id) {
    try {
      let confirm = await this.dialogService.confirm({ title: "提示", message: "删除后无法恢复，确定要删除？" });
      if (confirm) {
        await this.invoiceService.deleteInvoice(id);
        await this.dialogService.alert({ title: "提示", message: "删除成功！" });
        this.dataSource.read();
      }
    } catch (err) {
      await this.dialogService.alert({ title: "提示", message: err.message, icon: 'error' });
    }
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
  // 多选数据绑定
  selectionChange(event) {
    let grid = event.detail.sender as kendo.ui.Grid;
    this.selection = getSelectedDataItems(grid).map(data => data as Invoice);
  }
  // 汇款申请单
  async requisition() {
    if (!this.selection || this.selection.length == 0) {
      this.dialogService.alert({ title: "提示", message: "请选择发票", icon: "error" });
      return;
    }
    let result = await this.dialogService.open({ viewModel: RequisitionOut, model: null, lock: true })
    .whenClosed();
    if (result.wasCancelled) return;

    let out = result.output;
    let req = {selection : this.selection, out: out};
    await this.dialogService.open({ viewModel: PaymentRequisiton, model: req, lock: true });
  }
}
function getSelectedDataItems(grid: kendo.ui.Grid): any[] {
  return grid.select().toArray().map(tr => grid.dataItem(tr));
}
