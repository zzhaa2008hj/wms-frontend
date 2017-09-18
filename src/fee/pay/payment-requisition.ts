import { autoinject } from "aurelia-dependency-injection";
import { PaymentInfo } from "@app/fee/models/pay";
import { PaymentInfoService } from "@app/fee/services/pay";
import * as moment from 'moment';
import { convertCurrency } from '@app/utils';
import { print, addHeader } from "@app/common/services/print-tool";
import { OrganizationService } from "@app/base/services/organization";
import { Organization } from "@app/base/models/organization";

@autoinject
export class PaymentRequisiton {
  paymentInfo: PaymentInfo;
  date: string;
  organization: Organization;
  customer: Organization;
  constructor(private paymentInfoService: PaymentInfoService,
              private organizationService: OrganizationService) {

  }

  async activate({id}) {
    this.paymentInfo = await this.paymentInfoService.getPaymentInfoById(id);
    this.paymentInfo.payableAmountStr = convertCurrency(this.paymentInfo.payableAmount);
    let m = moment();
    this.date = m.year() + '年' + (m.month() + 1) + '月' + m.date() + '日';
    this.organization = await this.organizationService.getOrganization(this.paymentInfo.orgId);
    this.customer = await this.organizationService.getOrganization(this.paymentInfo.customerId);
  }

  print() {
    let title = "汇款申请单";
    let strHTML = $("#pay").html();
    strHTML = addHeader(strHTML);
    print(title, strHTML, true, 2);
  }
}