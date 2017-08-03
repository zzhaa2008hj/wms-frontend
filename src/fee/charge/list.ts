import { autoinject } from "aurelia-dependency-injection";
import { InvoiceEntry } from "@app/fee/charge/invoice";
import { DialogService } from "ui";
import { ChargeInfoService } from "@app/fee/services/charge";
import { Audit } from "@app/fee/charge/audit/new";
@autoinject
export class ChargeInfoList {
  dataSource: kendo.data.DataSource;

  constructor(private dialogService: DialogService,
    private chargeInfoService: ChargeInfoService) {

  }

  /**
   * 费收2审核
   */
  async auditSecondFee(id) {
    let result = await this.dialogService.open({ viewModel: Audit, model: {}, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
    try {
      await this.chargeInfoService.auditSecondFee(id, result.output);
      await this.dialogService.alert({ title: "提示", message: "审核通过！" });
      this.dataSource.read();
    } catch (err) {
      await this.dialogService.alert({ title: "提示", message: err.message, icon: "error" });
    }
  }

  /**
   * 发票录入
   */
  async invoiceEntry(id: string) {
    let result = await this.dialogService.open({ viewModel: InvoiceEntry, model: {}, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
    try {
      await this.chargeInfoService.issueChargeInvoice(id, result.output);
      await this.dialogService.alert({ title: "提示", message: "发票录入成功！" });
      this.dataSource.read();
    } catch (err) {
      await this.dialogService.alert({ title: "提示", message: err.message, icon: "error" });
    }
  }

  /**
   * 核销
   */
  async auditCancel(id: string) {
    try {
      let result = await this.dialogService.confirm({ title: "提示", message: "是否确定要核销当前结算需求！" });
      if (!result) return;
      await this.chargeInfoService.auditCancel(id);
      await this.dialogService.alert({ title: "提示", message: "核销成功！" });
      this.dataSource.read();
    } catch (err) {
      await this.dialogService.alert({ title: "提示", message: err.message, icon: "error" });
    }
  }
}