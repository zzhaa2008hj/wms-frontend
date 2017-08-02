import { autoinject } from "aurelia-dependency-injection";
import { handleResult, RestClient, fixDate, Query } from "@app/utils";
import { PaymentInfo, PaymentAuditList, PaymentAuditItem } from "@app/fee/models/pay";
@autoinject
export class PaymentInfoService {
  constructor(private http: RestClient) {
  }

  updateStage(id: string, stage: number) {
    return this.http.put(`/fee/paymentInfo/${id}/updateStage?stage=${stage}`, "").then(handleResult);
  }

  getPaymentInfoById(id: string): Promise<PaymentInfo> {
    return this.http.get(`/fee/paymentInfo/${id}`).then(res => {
      let paymentAuditList = res.content;
      paymentAuditList.fixDate(paymentAuditList, 'chargeStartDate', 'chargeEndDate', 'auditTime');
      return paymentAuditList;
    });
  }

  audit(id: string, status: number): Promise<void> {
    return this.http.put(`/fee/paymentInfo/auditPayInvoice/${id}?status=${status}`, "").then(handleResult);
  }
}

@autoinject
export class PaymentAuditListService {
  constructor(private http: RestClient) {
  }

  getByPaymentInfoId(paymentInfoId: string): Promise<PaymentAuditList> {
    return this.http.get(`/fee/paymentAuditList/${paymentInfoId}/getByPaymentInfoId`).then(res => res.content);
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
}