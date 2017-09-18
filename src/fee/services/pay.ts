import { autoinject } from "aurelia-dependency-injection";
import { handleResult, RestClient, fixDate, Query } from "@app/utils";
import { PaymentInfo, PaymentAuditItem } from '@app/fee/models/pay';
import { AttachmentMap } from '@app/common/models/attachment';
import { Organization } from '@app/base/models/organization';
import { Attachment } from '@app/common/models/attachment';

export interface PaymentInfoCriteria {
  keyword?: string;
  stage?: string;
}

@autoinject
export class PaymentInfoService {
  constructor(private http: RestClient) {
  }

  queryPaymentInfo(criteria?: PaymentInfoCriteria): Query<PaymentInfo> {
    return this.http.query<PaymentInfo>(`/fee/paymentInfo/page`, criteria);
  }

  /**
   * 获取有合同的装卸单位
   */
  listCustomersForWork(): Promise<Organization[]> {
    return this.http.get(`/base/customer/listForWork`).then(res => res.content);
  }

  /**
   * 获取装卸单位的结算开始日期
   * @param customerId
   */
  async getChargeStartDate(customerId: string): Promise<PaymentInfo> {
    return this.http.get(`/fee/paymentInfo/${customerId}/getChargeStartDate`)
      .then(res => {
        let paymentInfo = res.content;
        fixDate(paymentInfo, 'chargeStartDate');
        return paymentInfo;
      });
  }

  /**
   * 获取对账清单
   * @param paymentInfoId
   */
  getPaymentAuditList(paymentInfoId: string): Promise<PaymentInfo> {
    return this.http.get(`/fee/paymentInfo/${paymentInfoId}/items`).then(res => res.content);
  }

  /**
   * 获取对账清单的费用合计
   * @param paymentInfoId
   */
  // getPaymentAuditFee(paymentInfoId: string): Promise<PaymentAuditList> {
  //   return this.http.get(`/fee/paymentInfo/${paymentInfoId}/getPaymentAuditFee`).then(res => res.content);
  // }

  savePaymentInfo(paymentInfo: PaymentInfo): Promise<void> {
    return this.http.post(`/fee/paymentInfo`, paymentInfo).then(handleResult);
  }

  updatePaymentInfo(paymentInfo: PaymentInfo): Promise<void> {
    return this.http.put(`/fee/paymentInfo/${paymentInfo.id}`, paymentInfo).then(handleResult);
  }

  updateStage(id: string, stage: number) {
    return this.http.put(`/fee/paymentInfo/${id}/updateStage?stage=${stage}`, "").then(handleResult);
  }

  getPaymentInfoById(id: string): Promise<PaymentInfo> {
    return this.http.get(`/fee/paymentInfo/${id}`).then(res => {
      let paymentAuditList = res.content;
      fixDate(paymentAuditList, 'chargeStartDate', 'chargeEndDate', 'auditTime', 'createTime');
      return paymentAuditList;
    });
  }

  audit(id: string, status: number): Promise<void> {
    return this.http.put(`/fee/paymentInfo/auditPayInvoice/${id}?status=${status}`, "").then(handleResult);
  }

  verify(id: string, stage: number, list: AttachmentMap[]): Promise<void> {
    return this.http.put(`/fee/paymentInfo/${id}/id/${stage}/stage`, list).then(handleResult);
  }
  confirm(id: string, stage: number, list: Attachment[]): Promise<void> {
    return this.http.put(`/fee/paymentInfo/${id}/id/${stage}/stage`, list).then(handleResult);
  }

  invoice(id: string): Promise<void> {
    return this.http.put(`/fee/paymentInfo/issuePayInvoice/${id}`, null).then(handleResult);
  }

  verifyPay(id: string): Promise<void> {
    return this.http.put(`/fee/paymentInfo/paymentAuditCancel/${id}`, "").then(handleResult);
  }
  /**
   * 获取明细
   */
  getItems(customerId: string, chargeEndDate: string): Promise<PaymentAuditItem[]> {
    return this.http.get(`/fee/paymentInfo/items?customerId=${customerId}&chargeEndDate=${chargeEndDate}`)
    .then(res => res.content);
  }
}

export interface PaymentAuditItemCrieria {
  workOrderNumber?: string;
  paymentInfoId?: string;
}

@autoinject
export class PaymentAuditItemService {
  constructor(private http: RestClient) {

  }

  queryPaymentAuditItems(criteria: PaymentAuditItemCrieria): Query<PaymentAuditItem> {
    return this.http.query<PaymentAuditItem>(`/fee/paymentAuditItem/page`, criteria);
  }

  listByPaymentAuditId(paymentInfoId: string): Promise<PaymentAuditItem[]> {
    return this.http.get(`/fee/paymentAuditItem/${paymentInfoId}/list`).then(res => res.content);
  }
}