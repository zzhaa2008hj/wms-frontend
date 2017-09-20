import { autoinject } from "aurelia-dependency-injection";
import { PaymentInfoService } from "@app/fee/services/pay";
import * as moment from 'moment';
import { convertCurrency, accAdd, accSub } from '@app/utils';
import { print, addHeader } from "@app/common/services/print-tool";
import { OrganizationService } from "@app/base/services/organization";
import { Organization } from "@app/base/models/organization";
import { Invoice } from '@app/fee/models/invoice';
import { DialogService } from "ui";
@autoinject
export class PaymentRequisiton {
  payableAmountStr: string;
  payableAmount: number;
  date: string;
  organization: Organization;
  customer: Organization;
  out = {};
  constructor(private paymentInfoService: PaymentInfoService,
              private dialogService: DialogService,
              private organizationService: OrganizationService) {
  }

  async activate(req) {
    let invoices: Invoice[] = req.selection;
    this.out = req.out;
    let amount = 0, verificationAmount = 0;
    for (let invoice of invoices) {
      amount = accAdd(amount, invoice.amount);
      verificationAmount = accAdd(verificationAmount, invoice.verificationAmount);
    }
    this.payableAmount = parseFloat(accSub(amount, verificationAmount).toFixed(2));
    if (!this.payableAmount || this.payableAmount == 0) {
      await this.dialogService.alert({ title: "提示", message: "现有发票已都核销", icon: "error" });
      throw new Error('现有发票已都核销');
    }
    this.payableAmountStr = convertCurrency(this.payableAmount);
    let id = invoices[0].infoId;
    let paymentInfo = await this.paymentInfoService.getPaymentInfoById(id);
    let m = moment();
    this.date = m.year() + '年' + (m.month() + 1) + '月' + m.date() + '日';
    this.organization = await this.organizationService.getOrganization(paymentInfo.orgId);
    this.customer = await this.organizationService.getOrganization(paymentInfo.customerId);
  }

  print() {
    let title = "汇款申请单";
    let strHTML = $("#pay").html();
    strHTML = addHeader(strHTML);
    print(title, strHTML, true, 2);
  }
}