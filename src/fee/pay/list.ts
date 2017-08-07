import { autoinject } from "aurelia-dependency-injection";
import { PaymentInfoService } from "@app/fee/services/pay";
import { DataSourceFactory } from "@app/utils";
import { ConstantValues } from '@app/common/models/constant-values';
import { NewPaymentInfo } from '@app/fee/pay/new';
import { EditPaymentInfo } from '@app/fee/pay/edit';
import { DialogService, MessageDialogService } from 'ui';
import { VerifyRecordCriteria } from "@app/common/services/verify-record";
import { VerifyRecordDialogList } from "@app/common/verify-records/dialog-list";

@autoinject
export class PaymentInfoList {
  dataSource: kendo.data.DataSource;
  keyword: string;
  payStage = ConstantValues.PayStage;
  paymentInfotype = ConstantValues.PaymentInfoType;
  id: string = "";

  constructor(private paymentInfoService: PaymentInfoService,
    private dataSourceFactory: DataSourceFactory,
    private dialogService: DialogService,
    private messageDialogService: MessageDialogService) {

  }

  async activate() {
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.paymentInfoService.queryPaymentInfo({ keyword: this.keyword }).map(res => {
        res.stageTitle = this.payStage.find(r => r.stage == res.stage).title;
        res.typeTitle = this.paymentInfotype.find(r => r.stage == res.type).title;
        return res;
      }),
      pageSize: 10
    });
  }

  rowSelected(e) {
    let grid = e.sender;
    let selectedRow = grid.select();
    let dataItem = grid.dataItem(selectedRow);
    this.id = dataItem.id;
  }

  /**
   * 审核记录
   */
  async verifyHistory() {
    if (!this.id) {
      await this.messageDialogService.alert({ title: "提示", message: '请选择结算需求单', icon: "error" });
      return;
    }
    let criteria: VerifyRecordCriteria = {};
    criteria.businessId = this.id;
    criteria.businessType = 9;
    let result = await this.dialogService.open({ viewModel: VerifyRecordDialogList, model: criteria, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
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

  async edit(id) {
    let result = await this.dialogService.open({ viewModel: EditPaymentInfo, model: id, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
    let paymentInfo = result.output;
    try {
      await this.paymentInfoService.updatePaymentInfo(paymentInfo);
      await this.messageDialogService.alert({ title: "编辑成功", message: "编辑成功" });
      this.dataSource.read();
    } catch (err) {
      await this.messageDialogService.alert({ title: "编辑失败", message: err.message, icon: "error" });
    }
  }
}