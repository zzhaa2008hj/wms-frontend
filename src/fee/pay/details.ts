import { Router } from "aurelia-router";
import { autoinject } from "aurelia-dependency-injection";
import { PaymentAuditList, PaymentAuditItem, PaymentAuditListVo, PaymentInfo } from "@app/fee/models/pay";
import { PaymentInfoService } from "@app/fee/services/pay";
import * as moment from 'moment';
import { ConstantValues } from '@app/common/models/constant-values';

@autoinject
export class ViewPaymentInfo {
  datasource: kendo.data.DataSource;
  paymentAuditListVo: PaymentAuditListVo;
  paymentAuditList: PaymentAuditList;
  paymentInfo: PaymentInfo;
  paymentAuditItemList = [] as PaymentAuditItem[];

  paymentInfotype = ConstantValues.PaymentInfoType;
  invoiceStatus = ConstantValues.InvoiceStatus;
  paymentStatus = ConstantValues.PaymentStatus;
  invoiceType = ConstantValues.InvoiceType;

  constructor(private router: Router,
    private paymentInfoService: PaymentInfoService) {
    this.datasource = new kendo.data.DataSource({
      transport: {
        read: (options) => {
          options.success(this.paymentAuditItemList);
        }
      }
    });
  }

  /**
   * 初始化后自动执行
   */
  async activate({ id }) {
    this.paymentAuditListVo = await this.paymentInfoService.getPaymentAuditList(id);

    this.paymentAuditList = this.paymentAuditListVo.paymentAuditList;
    this.paymentAuditList.invoiceStatusStr = this.invoiceStatus.find(r => r.stage == this.paymentAuditList.invoiceStatus).title;
    this.paymentAuditList.paymentStatusStr = this.paymentStatus.find(r => r.stage == this.paymentAuditList.paymentStatus).title;
    this.paymentAuditList.invoiceTypeStr = this.invoiceType.find(r => r.stage == this.paymentAuditList.invoiceType).title;

    this.paymentAuditItemList = this.paymentAuditListVo.paymentAuditItemList;

    this.paymentInfo = this.paymentAuditListVo.paymentInfo;
    this.paymentInfo.chargeStartDateStr = moment(this.paymentInfo.chargeStartDate).format("YYYY-MM-DD");
    this.paymentInfo.chargeEndDateStr = moment(this.paymentInfo.chargeEndDate).format("YYYY-MM-DD");
    this.paymentInfo.typeTitle = this.paymentInfotype.find(r => r.stage == this.paymentInfo.type).title;
``  }

  cancel() {
    this.router.navigateToRoute("list");
  }
}
