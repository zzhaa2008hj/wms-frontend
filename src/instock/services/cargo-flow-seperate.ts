import { autoinject } from "aurelia-dependency-injection";
import { CargoFlowSeparate } from "@app/instock/models/cargo-flow-separate";
import { handleResult, Query, RestClient } from "@app/utils";
/**
 * Created by Hui on 2017/6/23.
 */
@autoinject
export class CargoFlowSeparateService {
  constructor(private http: RestClient) {
  }

  queryCargoFlowSeparates(param: { keywords: string }): Query<CargoFlowSeparate> {
    return this.http.query(`/instock/cargo-flow-separate/page`, param);
  }

  async saveCargoFlowSeparate(cargoFlowSeparate: CargoFlowSeparate) {
    await this.http.post(`/instock/cargo-flow`, cargoFlowSeparate).then(handleResult);
  }

}