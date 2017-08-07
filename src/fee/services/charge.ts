import { autoinject } from "aurelia-dependency-injection";
import { handleResult, Query, RestClient } from "@app/utils";
import { ChargeInfo } from "@app/fee/models/charge";
import { ChargeAuditList } from "@app/fee/models/charge-audit";
/**
 * Created by Hui on 2017/8/2.
 */
@autoinject
export class ChargeInfoService {
  constructor(private http: RestClient) {
  }

  customerConfirm(chargeInfoId: string): Promise<void> {
    return this.http.put(`/fee/charge-info/${chargeInfoId}/customerConfirm`, null).then(handleResult);
  }

  async getById(id: string): Promise<ChargeInfo> {
    let res = await this.http.get(`/fee/charge-info/${id}`);
    return res.content;
  }

  issueChargeInvoice(id: string, chargeAuditList: ChargeAuditList): Promise<void> {
    return this.http
      .put(`/fee/charge-info/chargeInvoice/${id}?invoiceType=${chargeAuditList.invoiceType}&invoiceNumber=${chargeAuditList.invoiceNumber}`, null)
      .then(handleResult);
  }

  auditSecondFee(id: string, status: number): Promise<void> {
    return this.http.put(`/fee/charge-info/${id}/${status}/audit`, null).then(handleResult);
  }

  auditCancel(id: string): Promise<void> {
    return this.http.put(`/fee/charge-info/chargeAuditCancel/${id}`, null).then(handleResult);
  }

  queryChargeInfo(): Query<ChargeInfo> {
    return this.http.query<ChargeInfo>(`/fee/charge-info/page`);
  }
}