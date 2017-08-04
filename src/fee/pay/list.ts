import { autoinject } from "aurelia-dependency-injection";
import { PaymentInfoService } from "@app/fee/services/pay";
import { DataSourceFactory } from "@app/utils";
import { ConstantValues } from '@app/common/models/constant-values';
import { NewPaymentInfo } from '@app/fee/pay/new';
import { DialogService, MessageDialogService } from 'ui';

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
    console.log(11)
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.paymentInfoService.queryPaymentInfo({ searchName: this.searchName }).map(res => {
        console.log(res)
        console.log(this.payStage)
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
}