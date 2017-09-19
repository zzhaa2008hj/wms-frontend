import { autoinject } from "aurelia-dependency-injection";
import { PaymentInfo, PaymentAuditItem } from "@app/fee/models/pay";
import { PaymentInfoService, PaymentAuditItemService } from "@app/fee/services/pay";
import * as moment from "moment";
import { print, addHeader } from "@app/common/services/print-tool";
import { DictionaryDataService } from "@app/base/services/dictionary";
import { DictionaryData } from "@app/base/models/dictionary";

@autoinject
export class Note {
  paymentInfo: PaymentInfo;
  disabled: boolean = false;
  paymentAuditItems: PaymentAuditItem[];
  units = [] as DictionaryData[];

  datasource: kendo.data.DataSource;
  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };

  constructor(private paymentInfoService: PaymentInfoService,
              private paymentAuditItemService: PaymentAuditItemService,
              private dictionaryDataService: DictionaryDataService) {

  }

  async activate(params) {
    this.units = await this.dictionaryDataService.getDictionaryDatas("unit");

    this.paymentInfo = await this.paymentInfoService.getPaymentInfoById(params.id);
    this.paymentInfo.chargeStartDateStr = this.paymentInfo.chargeStartDate ? moment(this.paymentInfo.chargeStartDate).format("YYYY-MM-DD") : '';
    this.paymentInfo.chargeEndDateStr = this.paymentInfo.chargeEndDate ? moment(this.paymentInfo.chargeEndDate).format("YYYY-MM-DD") : '';
    this.paymentInfo.createTimeStr = moment(this.paymentInfo.createTime).format("YYYY-MM-DD");

    let index = 1;
    this.paymentAuditItems = await this.paymentAuditItemService.listByPaymentAuditId(params.id).then(
      res => res.map(r => {
        r.workDateStr = moment(r.workDate).format("YYYY-MM-DD");
        r.index = index++;
        let unit = this.units.find(e => e.dictDataCode == r.unit);
        if (unit) {
          r.unitStr = unit.dictDataName;
        }
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