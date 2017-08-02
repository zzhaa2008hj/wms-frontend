import { autoinject } from "aurelia-dependency-injection";
import { handleResult, RestClient } from "@app/utils";
import { ChargeInfo } from "@app/fee/models/charge";
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
}