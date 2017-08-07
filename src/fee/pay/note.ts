import { autoinject } from "aurelia-dependency-injection";
import { PaymentInfo, PaymentAuditList, PaymentAuditItem } from "@app/fee/models/pay";
import { PaymentInfoService, PaymentAuditListService, PaymentAuditItemService } from "@app/fee/services/pay";
import * as moment from "moment";
import { print, addHeader } from "@app/common/services/print-tool";

@autoinject
export class Note {
  paymentInfo: PaymentInfo;
  paymentAuditList: PaymentAuditList;
  disabled: boolean = false;
  paymentAuditItems: PaymentAuditItem[];

  datasource: kendo.data.DataSource;
  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };

  constructor(private paymentInfoService: PaymentInfoService,
              private paymentAuditListService: PaymentAuditListService,
              private paymentAuditItemService: PaymentAuditItemService) {

  }

  async activate(params) {
    this.paymentInfo = await this.paymentInfoService.getPaymentInfoById(params.id);
    this.paymentInfo.chargeStartDateStr = moment(this.paymentInfo.chargeStartDate).format("YYYY-MM-DD");
    this.paymentInfo.chargeEndDateStr = moment(this.paymentInfo.chargeEndDate).format("YYYY-MM-DD");
    this.paymentInfo.createTimeStr = moment(this.paymentInfo.createTime).format("YYYY-MM-DD");
    this.paymentAuditList = await this.paymentAuditListService.getByPaymentInfoId(params.id);

    let index = 1;
    this.paymentAuditItems = await this.paymentAuditItemService.listByPaymentAuditId(this.paymentAuditList.id).then(
      res => res.map(r => {
        r.workDateStr = moment(r.workDate).format("YYYY-MM-DD");
        r.index = index++;
        return r;
      })
    );
    if (params.status == 1) {
      this.paymentInfoService.updateStage(params.id, 6);
    }
  }

  async print() {
    let title = "付费单";
    let strHTML = $("#note").html();
    strHTML = addHeader(strHTML);
    print(title, strHTML, true);
  }
}