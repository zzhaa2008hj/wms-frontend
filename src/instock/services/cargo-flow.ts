import { autoinject } from "aurelia-dependency-injection";
import { extractResult, handleResult, Query, RestClient } from "../../utils";
import { CargoFlow } from "../models/cargo-flow";
/**
 * Created by Hui on 2017/6/23.
 */
@autoinject
export class CargoFlowService {
  constructor(private http: RestClient) {
  }

  queryCargoFlows(param: { keywords: string }): Query<CargoFlow> {
    return this.http.query(`/instock/cargo-flow/page`, param);
  }

  async saveCargoFlow(cargoFlow: CargoFlow) {
    await this.http.post(`/instock/cargo-flow`, cargoFlow).then(handleResult);
  }

  async updateVisible(id: string) {
    await this.http.put(`/instock/cargo-flow/${id}`, null).then(handleResult);
  }

}