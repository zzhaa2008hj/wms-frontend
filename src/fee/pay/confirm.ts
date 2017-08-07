import { autoinject } from "aurelia-dependency-injection";
import { PaymentInfo, PaymentAuditList } from "@app/fee/models/pay";
import { PaymentInfoService, PaymentAuditListService } from "@app/fee/services/pay";
import * as moment from 'moment';
import { DialogService } from "ui";
import { UploadConfirm } from "./upload-confirm";
import { Router } from "aurelia-router";
import { print, addHeader } from "@app/common/services/print-tool";

@autoinject
export class PaymentConfirm {
  paymentInfo: PaymentInfo;
  paymentAuditList: PaymentAuditList;
  paymentInfoId: string;

  constructor(private paymentInfoService: PaymentInfoService,
              private paymentAuditListService: PaymentAuditListService,
              private dialogService: DialogService,
              private router: Router) {

  }

  async activate(params) {
    this.paymentInfoId = params.id;
    this.paymentInfo = await this.paymentInfoService.getPaymentInfoById(params.id);
    this.paymentInfo.chargeEndDateStr = moment(this.paymentInfo.chargeEndDate).format("YYYY-MM-DD");
    this.paymentInfo.chargeStartDateStr = moment(this.paymentInfo.chargeStartDate).format("YYYY-MM-DD");
    this.paymentInfo.createTimeStr = moment(this.paymentInfo.createTime).format("YYYY-MM-DD");
    this.paymentAuditList = await this.paymentAuditListService.getByPaymentInfoId(params.id);
  }

  async check(num) {
    //返回值result.output
    try {
      if (num == 0) {
        await this.paymentInfoService.confirm(this.paymentInfo.id, 0, []);
      }
      if (num == 1) {
        let result = await this.dialogService.open({
          viewModel: UploadConfirm,
          model: this.paymentInfoId,
          lock: true
        }).whenClosed();
        if (result.wasCancelled) return;
        await this.paymentInfoService.confirm(this.paymentInfo.id, 3, result.output);
      }
      await this.dialogService.alert({ title: "提示", message: "操作成功" });
      this.router.navigateToRoute("list");
    } catch (e) {
      await this.dialogService.alert({ title: "提示", message: e.message });
    }
  }

  print() {
    let title = "对账清单";
    let strHTML = $("#confirm").html();
    strHTML = addHeader(strHTML);
    print(title, strHTML, true);
  }
}