import { autoinject } from "aurelia-dependency-injection";
import { ChargeAuditList } from "@app/fee/models/charge-audit";
import { RestClient } from "@app/utils";
/**
 * Created by Hui on 2017/8/2.
 */
@autoinject
export class ChargeAuditListService {
  constructor(private http: RestClient) {
  }

  async getListByChargeInfoId(chargeInfoId: string): Promise<ChargeAuditList[]> {
    let res = await this.http.get(`/fee/charge-audit-list/${chargeInfoId}/chargeInfoId`);
    return res.content;
  }
}

@autoinject
export class ChargeAuditItemService {
  constructor(private http: RestClient) {
  }

  async getListByChargeAuditId(chargeAuditId: string) {
    let res = await this.http.get(`/fee/charge-audit-item/${chargeAuditId}/chargeAuditId`);
    return res.content;
  }
}