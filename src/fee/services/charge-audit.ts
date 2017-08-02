import { autoinject } from "aurelia-dependency-injection";
import { ChargeAuditList } from "@app/fee/models/charge-audit";
import { RestClient } from "@app/utils";
import { ChargeInfo } from "@app/fee/models/charge";
/**
 * Created by Hui on 2017/8/2.
 */
@autoinject
export class ChargeAuditListService {
  constructor(private http: RestClient) {
  }

  async getByChargeInfoId(chargeInfoId: string): Promise<ChargeAuditList[]> {
    let res = await this.http.get(`/fee/charge-audit-list/${chargeInfoId}/chargeInfoId`);
    return res.content;
  }
}

@autoinject
export class ChargeAuditItemService {
  constructor(private http: RestClient) {
  }

  async getById(id: string): Promise<ChargeInfo> {
    let res = await this.http.get(`/fee/charge-info/${id}`);
    return res.content;
  }
}