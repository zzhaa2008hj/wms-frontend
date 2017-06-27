import { autoinject } from "aurelia-dependency-injection";
import { handleResult, Query, RestClient } from "@app/utils";
import { CargoFlow } from "@app/instock/models/cargo-flow";
import { CargoInfo, CargoItem } from "@app/base/models/cargo-info";
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

  saveCargoFlow(cargoFlow: CargoFlow): Promise<void> {
    return this.http.post(`/instock/cargo-flow`, cargoFlow).then(handleResult);
  }

  updateVisible(id: string): Promise<void> {
    return this.http.put(`/instock/cargo-flow/${id}`, null).then(handleResult);
  }


  async listCargoInfos(): Promise<CargoInfo> {
    let res = await this.http.get(`/base/cargoInfo/list`);
    return res.content;
  }

  async listCargoItems(cargoInfoId: string): Promise<CargoItem> {
    let res = await  this.http.get(`/instock/cargo-flow/${cargoInfoId}/cargoItemList`);
    return res.content;
  }
}