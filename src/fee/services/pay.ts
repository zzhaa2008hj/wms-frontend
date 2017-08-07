import { autoinject } from "aurelia-dependency-injection";
import { handleResult, RestClient, fixDate, Query } from "@app/utils";
import { PaymentInfo, PaymentAuditList, PaymentAuditItem, PaymentAuditListVo } from '@app/fee/models/pay';
import { AttachmentMap } from '@app/common/models/attachment';
import { Organization } from '@app/base/models/organization';
import { Invoice } from '@app/fee/models/invoice';
import { Attachment } from '@app/common/models/attachment';

export interface PaymentInfoCriteria {
  keyword?: string;
}

@autoinject
export class PaymentInfoService {
  constructor(private http: RestClient) {
  }

  queryPaymentInfo(criteria?: PaymentInfoCriteria): Query<PaymentInfo> {
    return this.http.query<PaymentInfo>(`/fee/paymentInfo/page`, criteria)
      .map(c => fixDate(c, 'chargeStartDate', 'chargeEndDate'));
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
  getPaymentAuditList(paymentInfoId: string): Promise<PaymentAuditListVo> {
    return this.http.get(`/fee/paymentInfo/${paymentInfoId}/getPaymentAuditList`)
      .then(res => {
        let paymentAuditListVo = res.content;
        fixDate(paymentAuditListVo.paymentInfo, 'chargeStartDate', 'chargeEndDate');
        fixDate(paymentAuditListVo.paymentAuditList, 'paymentDate');
        paymentAuditListVo.paymentAuditItemList.map(c => fixDate(c, 'workDate'));
        return paymentAuditListVo;
      });
  }

  /**
   * 获取对账清单的费用合计
   * @param paymentInfoId 
   */
  getPaymentAuditFee(paymentInfoId: string): Promise<PaymentAuditList> {
    return this.http.get(`/fee/paymentInfo/${paymentInfoId}/getPaymentAuditFee`).then(res => res.content);
  }

  savePaymentInfo(paymentInfo: PaymentInfo): Promise<void> {
    if (paymentInfo.type == 1) {
      return this.http.post(`/fee/paymentInfo`, paymentInfo).then(handleResult);
    }
    return this.http.post(`/fee/paymentInfo?sumFee=${paymentInfo.sumFee}`, paymentInfo).then(handleResult);
  }

  updatePaymentInfo(paymentInfo: PaymentInfo): Promise<void> {
    if (paymentInfo.type == 1) {
      return this.http.put(`/fee/paymentInfo/${paymentInfo.id}`, paymentInfo).then(handleResult);
    }
    return this.http
      .put(`/fee/paymentInfo/${paymentInfo.id}?sumFee=${paymentInfo.sumFee}`, paymentInfo)
      .then(handleResult);
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

  invoice(id: string, paymentAuditList: PaymentAuditList): Promise<void> {
    return this.http.put(`/fee/paymentInfo/issuePayInvoice/${id}`, paymentAuditList).then(handleResult);
  }

  verifyPay(id: string): Promise<void> {
    return this.http.put(`/fee/paymentInfo/paymentAuditCancel/${id}`, "").then(handleResult);
  }
}

@autoinject
export class PaymentAuditListService {
  constructor(private http: RestClient) {
  }

  getByPaymentInfoId(paymentInfoId: string): Promise<PaymentAuditList> {
    return this.http.get(`/fee/paymentAuditList/${paymentInfoId}/getByPaymentInfoId`).then(res => res.content);
  }

  updateByPaymentInfoId(paymentInfoId: string, invoice: Invoice): Promise<void> {
    return this.http.put(`/fee/paymentAuditList/${paymentInfoId}/updateByPaymentInfoId`, invoice).then(handleResult);
  }
}

export interface PaymentAuditItemCrieria {
  workOrderNumber?: string;
  paymentAuditId?: string;
}

@autoinject
export class PaymentAuditItemService {
  constructor(private http: RestClient) {

  }

  queryPaymentAuditItems(criteria: PaymentAuditItemCrieria): Query<PaymentAuditItem> {
    return this.http.query<PaymentAuditItem>(`/fee/paymentAuditItem/page`, criteria)
      .map(res => fixDate(res, "workDate"));
  }

  listByPaymentAuditId(paymentAuditId: string): Promise<PaymentAuditItem[]> {
    return this.http.get(`/fee/paymentAuditItem/${paymentAuditId}/list`).then(res => {
      res.content.map(r => fixDate(r, "workDate"));
      return res.content;
    });
  }
}