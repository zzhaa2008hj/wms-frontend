import { autoinject } from "aurelia-dependency-injection";
import { PaymentInfo, PaymentAuditList } from "@app/fee/models/pay";
import { PaymentInfoService, PaymentAuditListService, PaymentAuditItemService } from "@app/fee/services/pay";
import * as moment from "moment";
import { DataSourceFactory } from "@app/utils";
import { DialogService } from "ui";
import { Router } from "aurelia-router";

@autoinject
export class Verify {
  paymentInfo: PaymentInfo;
  paymentAuditList: PaymentAuditList;
  disabled: boolean = false;

  datasource: kendo.data.DataSource;
  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };

  constructor(private paymentInfoService: PaymentInfoService,
              private paymentAuditListService: PaymentAuditListService,
              private paymentAuditItemService: PaymentAuditItemService,
              private dataSourceFactory: DataSourceFactory,
              private dialogService: DialogService,
              private router: Router) {

  }

  async activate(params) {
    this.paymentInfo = await this.paymentInfoService.getPaymentInfoById(params.id);
    this.paymentInfo.chargeStartDateStr = moment(this.paymentInfo.chargeStartDate).format("YYYY-MM-DD");
    this.paymentInfo.chargeEndDateStr = moment(this.paymentInfo.chargeEndDate).format("YYYY-MM-DD");
    this.paymentAuditList = await this.paymentAuditListService.getByPaymentInfoId(params.id);

    this.datasource = this.dataSourceFactory.create({
      query: () => this.paymentAuditItemService.queryPaymentAuditItems({ paymentAuditId: this.paymentAuditList.id }),
      pageSize: 10
    });
  }

  async check(param) {
    try {
      this.disabled = true;
      await this.paymentInfoService.audit(this.paymentInfo.id, param);
      await this.dialogService.alert({ title: "提示", message: "操作成功" });
      this.router.navigateToRoute("list");
    } catch (e) {
      await this.dialogService.alert({ title: "操作失败", message: e.message, icon: "error" });
      this.disabled = false;
    }
  }
}