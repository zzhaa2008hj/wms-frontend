import { autoinject } from "aurelia-dependency-injection";
import { handleResult, RestClient } from "@app/utils";
import { ChargeInfo } from "@app/fee/models/charge";
import { Invoice } from "@app/fee/models/invoice";
/**
 * Created by Hui on 2017/8/2.
 */
@autoinject
export class ChargeInfoService {
  constructor(private http: RestClient) {
  }

  customerConfirm(chargeInfoId: string): Promise<void> {
    return this.http.post(`/fee/charge-info/${chargeInfoId}/customerConfirm`, null).then(handleResult);
  }

  async getById(id: string): Promise<ChargeInfo> {
    let res = await this.http.get(`/fee/charge-info/${id}`);
    return res.content;
  }

  issueChargeInvoice(id: string, invoice: Invoice): Promise<void> {
    return this.http.put(`/fee/charge-info//chargeInvoice/${id}`, invoice).then(handleResult);
  }

  auditSecondFee(id: string, status: number): Promise<void> {
    return this.http.put(`/fee/charge-info/${id}/${status}/audit`, null).then(handleResult);
  }

  auditCancel(id: string): Promise<void> {
    return this.http.put(`/fee/charge-info/chargeAuditCancel/${id}`, null).then(handleResult);
  }
}