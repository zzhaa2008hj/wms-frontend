import { autoinject } from "aurelia-dependency-injection";
import { PaymentInfoService } from "@app/fee/services/pay";
import { DataSourceFactory } from "@app/utils";
import { ConstantValues } from '@app/common/models/constant-values';
import { NewManualPaymentInfo } from '@app/fee/pay/new-manual';
import { EditPaymentInfo } from '@app/fee/pay/edit-manual';
import { DialogService, MessageDialogService } from 'ui';
import { LeaderVerify } from "./leader-verify";
import { VerifyRecordCriteria } from "@app/common/services/verify-record";
import { VerifyRecordDialogList } from "@app/common/verify-records/dialog-list";
import { InvoiceService } from '@app/fee/services/invoice';
import { VerificationService } from '@app/fee/services/verification';
@autoinject
export class PaymentInfoList {
  dataSource: kendo.data.DataSource;
  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };
  keyword: string;
  stage: string;
  payStage = ConstantValues.PayStage;
  paymentInfotype = ConstantValues.PaymentInfoType;
  id: string = "";

  // 未结算、已生成对账清单、已核对生成付费单、已开票、已付费核销
  payStages = [{ text: "未结算", value: "0" }, { text: "已生成对账清单", value: "1" }, { text: "已核对生成付费单", value: "6" },
    { text: "已开票", value: "8" }, { text: "已付费核销", value: "9" }];

  constructor(private paymentInfoService: PaymentInfoService,
              private dataSourceFactory: DataSourceFactory,
              private dialogService: DialogService,
              private messageDialogService: MessageDialogService,
              private invoiceService: InvoiceService,
              private verificationService: VerificationService) {

  }

  async activate() {
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.paymentInfoService.queryPaymentInfo({ keyword: this.keyword, stage: this.stage }).map(res => {
        let stage = this.payStage.find(r => r.stage == res.stage);
        if (stage) {
          res.stageTitle = stage.title;
        }
        let lastStage = this.payStage.find(r => r.stage == res.lastStage);
        if (lastStage) {
          res.lastStageTitle = lastStage.title;
        }
        let type = this.paymentInfotype.find(r => r.stage == res.type);
        if (type) {
          res.typeTitle = type.title;
        }
        res.chargeStartDate = new Date(res.chargeStartDate);
        if (res.chargeEndDate) {
          res.chargeEndDate = new Date(res.chargeEndDate);
        }
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

  reset() {
    this.keyword = '';
    this.stage = '';
    this.dataSource.read();
  }

  async add() {
    let result = await this.dialogService.open({ viewModel: NewManualPaymentInfo, lock: true })
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
    let confirmed = await this.dialogService.confirm({ title: "提示", message: "确认录入发票完成" });
    if (!confirmed) return;
    try {
      await this.paymentInfoService.invoice(id);
      await this.dialogService.alert({ title: "提示", message: "录入发票完成" });
      this.dataSource.read();
    } catch (e) {
      await this.dialogService.alert({ title: "错误", message: e.message, icon: "error" });
    }
  }

  async verifyPay(id) {
    let invoice = await this.invoiceService.getInvoices(id, 2);
    
    if (invoice && invoice.length > 0) {
    }else {
      await this.dialogService.alert({ title: "提示", message: "发票还未录入", icon: "error" });
    }
    
    let confirmed = await this.dialogService.confirm({ title: "提示", message: "确认付费核销完成" });
    if (!confirmed) return;
    try {
      await this.paymentInfoService.verifyPay(id);
      await this.dialogService.alert({ title: "提示", message: "核销成功" });
      this.dataSource.read();
    } catch (e) {
      await this.dialogService.alert({ title: "错误", message: e.message, icon: "error" });
    }
  }
}