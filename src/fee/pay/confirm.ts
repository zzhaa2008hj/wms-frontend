import { autoinject } from "aurelia-dependency-injection";
import { PaymentInfo, PaymentAuditItem } from "@app/fee/models/pay";
import { PaymentInfoService, PaymentAuditItemService } from "@app/fee/services/pay";
import * as moment from 'moment';
import { DialogService } from "ui";
import { UploadConfirm } from "./upload-confirm";
import { Router } from "aurelia-router";
import { print, addHeader } from "@app/common/services/print-tool";
import { DictionaryDataService } from "@app/base/services/dictionary";
import { DictionaryData } from "@app/base/models/dictionary";

@autoinject
export class PaymentConfirm {
  paymentInfo: PaymentInfo;
  paymentInfoId: string;
  paymentAuditItems: PaymentAuditItem[];
  units = [] as DictionaryData[];

  constructor(private paymentInfoService: PaymentInfoService,
              private dialogService: DialogService,
              private router: Router,
              private paymentAuditItemService: PaymentAuditItemService,
              private dictionaryDataService: DictionaryDataService) {

  }

  async activate(params) {
    this.units = await this.dictionaryDataService.getDictionaryDatas('unit');

    this.paymentInfoId = params.id;
    this.paymentInfo = await this.paymentInfoService.getPaymentInfoById(params.id);
    if (this.paymentInfo.chargeEndDate) {
      this.paymentInfo.chargeEndDateStr = moment(this.paymentInfo.chargeEndDate).format("YYYY-MM-DD");
    }
    if (this.paymentInfo.chargeStartDate) {
      this.paymentInfo.chargeStartDateStr = moment(this.paymentInfo.chargeStartDate).format("YYYY-MM-DD");
    }
    this.paymentInfo.createTimeStr = moment(this.paymentInfo.createTime).format("YYYY-MM-DD");

    let index = 1;
    this.paymentAuditItems = await this.paymentAuditItemService.listByPaymentAuditId(this.paymentInfoId).then(
      res => res.map(r => {
        r.workDateStr = moment(r.workDate).format("YYYY-MM-DD");
        r.index = index++;
        let unit = this.units.find(e => e.dictDataCode == r.unit);
        if (unit) {
          r.unit = unit.dictDataName;
        }
        return r;
      })
    );
  }

  async check(num) {
    try {
      if (num == -1) {
        let confirmed = await this.dialogService.confirm({ title: "提示", message: "确认作废此单？" });
        if (!confirmed) return;
        await this.paymentInfoService.confirm(this.paymentInfo.id, -1, []);
      }
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

  printDetail() {
    let title = "对账清单";
    let strHTML = $("#detail").html();
    strHTML = addHeader(strHTML);
    print(title, strHTML, true, 2);
  }

  printTotal() {
    let title = "对账清单明细";
    let strHTML = $("#total").html();
    strHTML = addHeader(strHTML);
    print(title, strHTML, true, 2);
  }

  exportTotal() {
    
  }
    
  exportDetail() {
        
  }
}