import { autoinject } from "aurelia-dependency-injection";
import { PaymentInfo, PaymentAuditList, PaymentAuditItem } from "@app/fee/models/pay";
import { PaymentInfoService, PaymentAuditListService, PaymentAuditItemService } from "@app/fee/services/pay";
import * as moment from "moment";
import { DialogService } from "ui";

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
              private paymentAuditItemService: PaymentAuditItemService,
              private dialogService: DialogService) {

  }

  async activate(params) {
    this.paymentInfo = await this.paymentInfoService.getPaymentInfoById(params.id);
    this.paymentInfo.chargeStartDateStr = moment(this.paymentInfo.chargeStartDate).format("YYYY-MM-DD");
    this.paymentInfo.chargeEndDateStr = moment(this.paymentInfo.chargeEndDate).format("YYYY-MM-DD");
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
    await this.dialogService.alert({ title: "提示", message: "打印成功" });
  }
}