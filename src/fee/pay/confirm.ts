import { autoinject } from "aurelia-dependency-injection";
import { PaymentInfo, PaymentAuditList } from "@app/fee/models/pay";
import { PaymentInfoService, PaymentAuditListService } from "@app/fee/services/pay";
import * as moment from 'moment';
import { DialogService } from "ui";
import { UploadConfirm } from "./upload-confirm";

@autoinject
export class PaymentConfirm {
  paymentInfo: PaymentInfo;
  paymentAuditList: PaymentAuditList;

  constructor(private paymentInfoService: PaymentInfoService,
              private paymentAuditListService: PaymentAuditListService,
              private dialogService: DialogService) {

  }

  async activate(params) {
    this.paymentInfo = await this.paymentInfoService.getPaymentInfoById(params.id);
    this.paymentInfo.chargeEndDateStr = moment(this.paymentInfo.chargeEndDate).format("YYYY-MM-DD");
    this.paymentInfo.chargeStartDateStr = moment(this.paymentInfo.chargeStartDate).format("YYYY-MM-DD");
    this.paymentAuditList = await this.paymentAuditListService.getByPaymentInfoId(params.id);
  }

  async check() {
    let result = await this.dialogService.open({ viewModel: UploadConfirm, model: {}, lock: true }).whenClosed();
    if (result.wasCancelled) return;
    //返回值result.output
    try {
      this.paymentInfoService.updateStage(this.paymentInfo.id, 2);
      await this.dialogService.alert({ title: "提示", message: "操作成功" });
    } catch (e) {
      await this.dialogService.alert({ title: "提示", message: e.message });
    }
  }

  async print() {
    await this.dialogService.alert({ title: "提示", message: "打印成功" });
  }
}