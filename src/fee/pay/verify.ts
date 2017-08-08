import { autoinject } from "aurelia-dependency-injection";
import { PaymentInfo, PaymentAuditList } from "@app/fee/models/pay";
import { PaymentInfoService, PaymentAuditListService, PaymentAuditItemService } from "@app/fee/services/pay";
import * as moment from "moment";
import { DataSourceFactory } from "@app/utils";
import { DialogService } from "ui";
import { Router } from "aurelia-router";
import { ConstantValues } from "@app/common/models/constant-values";
import { DictionaryDataService } from "@app/base/services/dictionary";
import { DictionaryData } from "@app/base/models/dictionary";

@autoinject
export class Verify {
  paymentInfo: PaymentInfo;
  paymentAuditList: PaymentAuditList;
  disabled: boolean = false;
  paymentInfoType = ConstantValues.PaymentInfoType;
  units = [] as DictionaryData[];
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
              private router: Router,
              private dictionaryDataService: DictionaryDataService) {

  }

  async activate(params) {
    this.units = await this.dictionaryDataService.getDictionaryDatas('unit');

    this.paymentInfo = await this.paymentInfoService.getPaymentInfoById(params.id);
    this.paymentInfo.chargeStartDateStr = moment(this.paymentInfo.chargeStartDate).format("YYYY-MM-DD");
    this.paymentInfo.chargeEndDateStr = moment(this.paymentInfo.chargeEndDate).format("YYYY-MM-DD");
    this.paymentInfo.typeTitle = this.paymentInfoType.find(r => r.stage == this.paymentInfo.type).title;
    this.paymentAuditList = await this.paymentAuditListService.getByPaymentInfoId(params.id);

    this.datasource = this.dataSourceFactory.create({
      query: () => this.paymentAuditItemService.queryPaymentAuditItems({ paymentAuditId: this.paymentAuditList.id })
        .map(
          res => {
            if (res.unit) {
              res.unit = this.units.find(r => r.dictDataCode == res.unit).dictDataName;
            }
            return res;
          }
        ),
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