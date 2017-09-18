import { Router } from "aurelia-router";
import { autoinject } from "aurelia-dependency-injection";
import { PaymentInfo } from "@app/fee/models/pay";
import { PaymentInfoService } from "@app/fee/services/pay";
import * as moment from 'moment';
import { ConstantValues } from '@app/common/models/constant-values';
import { DictionaryDataService } from '@app/base/services/dictionary';

@autoinject
export class ViewPaymentInfo {
  paymentInfo = {} as PaymentInfo;
  paymentInfotype = ConstantValues.PaymentInfoType;
  invoiceStatus = ConstantValues.InvoiceStatus;
  paymentStatus = ConstantValues.PaymentStatus;
  invoiceType = ConstantValues.InvoiceType;

  datasource = new kendo.data.DataSource({
    transport: {
      read: (options) => {
        options.success(this.paymentInfo.paymentAuditItemList);
      }
    }
  });
  constructor(private router: Router,
              private dictionaryDataService: DictionaryDataService,
              private paymentInfoService: PaymentInfoService) {
  }

  /**
   * 初始化后自动执行
   */
  async activate({ id }) {
    let units = await this.dictionaryDataService.getDictionaryDatas('unit');

    this.paymentInfo = await this.paymentInfoService.getPaymentAuditList(id);
    if (this.paymentInfo.paymentAuditItemList && this.paymentInfo.paymentAuditItemList.length > 0) {
      this.paymentInfo.paymentAuditItemList.map(res => {
        if (res.unit) {
          res.unit = units.find(r => r.dictDataCode == res.unit).dictDataName;
        }
        res.workDate = new Date(res.workDate);
        return res;
      });
    }
    
    this.paymentInfo.chargeStartDateStr = moment(this.paymentInfo.chargeStartDate).format("YYYY-MM-DD");
    this.paymentInfo.chargeEndDateStr = moment(this.paymentInfo.chargeEndDate).format("YYYY-MM-DD");
    let type = this.paymentInfotype.find(r => r.stage == this.paymentInfo.type);
    if (type) {
      this.paymentInfo.typeTitle = type.title;
    }
  }

  cancel() {
    this.router.navigateToRoute("list");
  }
}
