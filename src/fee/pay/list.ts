import { autoinject } from "aurelia-dependency-injection";
import { PaymentInfoService } from "@app/fee/services/pay";
import { DataSourceFactory } from "@app/utils";
import { ConstantValues } from '@app/common/models/constant-values';
import { NewPaymentInfo } from '@app/fee/pay/new';
import { DialogService, MessageDialogService } from 'ui';
import { LeaderVerify } from "./leader-verify";
import { InvoiceInput } from "./invoice";

@autoinject
export class ChargeInfoList {
  dataSource: kendo.data.DataSource;
  searchName: string;
  payStage = ConstantValues.PayStage;

  constructor(private paymentInfoService: PaymentInfoService,
              private dataSourceFactory: DataSourceFactory,
              private dialogService: DialogService,
              private messageDialogService: MessageDialogService) {

  }

  async activate() {
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.paymentInfoService.queryPaymentInfo({ searchName: this.searchName }).map(res => {
        res.statusTitle = this.payStage.find(r => r.stage == res.stage).title;
        return res;
      }),
      pageSize: 10
    });
  }

  select() {
    this.dataSource.read();
  }

  async add() {
    let result = await this.dialogService.open({ viewModel: NewPaymentInfo, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
    let paymentInfo = result.output;
    try {
      await this.paymentInfoService.savePaymentInfo(paymentInfo);
      await this.messageDialogService.alert({ title: "新增成功", message: "新增成功！" });
      this.dataSource.read();
    } catch (err) {
      await this.messageDialogService.alert({ title: "新增失败", message: err.message, icon: "error" });
    }

  }

  async leaderVerify(id) {
    try {
      let result = await this.dialogService.open({ viewModel: LeaderVerify, model: id, lock: true }).whenClosed();
      if (result.wasCancelled) return;
      await this.paymentInfoService.confirm(id, 7, result.output);
      await this.dialogService.alert({ title: "提示", message: "领导签字确认成功" });
      this.dataSource.read();
    } catch (e) {
      await this.dialogService.alert({ title: "错误", message: e.message, icon: "error" });
    }
  }

  async invoice(id) {
    try {
      let result = await this.dialogService.open({ viewModel: InvoiceInput, model: id, lock: true }).whenClosed();
      if (result.wasCancelled) return;
      await this.paymentInfoService.invoice(id, result.output);
      await this.dialogService.alert({ title: "提示", message: "成功录入发票" });
      this.dataSource.read();
    } catch (e) {
      await this.dialogService.alert({ title: "错误", message: e.message, icon: "error" });
    }
  }

  async verifyPay(id) {
    try {
      await this.paymentInfoService.verifyPay(id);
      await this.dialogService.alert({ title: "提示", message: "核销成功" });
      this.dataSource.read();
    } catch (e) {
      await this.dialogService.alert({ title: "错误", message: e.message, icon: "error" });
    }
  }
}