import { autoinject } from "aurelia-dependency-injection";
import { CargoFlowSeparate } from "@app/instock/models/cargo-flow-separate";
import { handleResult, Query, RestClient } from "@app/utils";
import { CargoFlow } from "@app/instock/models/cargo-flow";
/**
 * Created by Hui on 2017/6/23.
 */
@autoinject
export class CargoFlowSeparateService {
  constructor(private http: RestClient) {
  }

  queryCargoFlowSeparates(param: { flowId: string, keywords: string }): Query<CargoFlowSeparate> {
    return this.http.query(`/instock/cargo-flow-separate/page`, param);
  }

  async saveCargoFlowSeparate(cargoFlow: CargoFlow) {
    await this.http.post(`/instock/cargo-flow-separate`, cargoFlow).then(handleResult);
  }

  async getCargoFlowSeparateById(id) {
    let res = await this.http.get(`/instock/cargo-flow-separate/${id}`);
    return res.content;
  }
}