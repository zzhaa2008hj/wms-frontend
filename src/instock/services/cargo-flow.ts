import { autoinject } from "aurelia-dependency-injection";
import { handleResult, Query, RestClient, fixDate } from "@app/utils";
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
    return this.http.query<CargoFlow>(`/instock/cargo-flow/page`, param).map(flow => fixDate(flow, 'instockDate'));
  }

  async saveCargoFlow(cargoFlow: CargoFlow) {
    await this.http.post(`/instock/cargo-flow`, cargoFlow).then(handleResult);
  }

  async listBaseCargoInfos(): Promise<CargoInfo> {
    let res = await this.http.get(`/base/cargoInfo/list`);
    return res.content;
  }

  async listBaseCargoItems(cargoInfoId: string): Promise<CargoItem> {
    let res = await  this.http.get(`/instock/cargo-flow/${cargoInfoId}/baseCargoItemList`);
    return res.content;
  }

  getCargoFlowById(id: string): Promise<CargoFlow> {
    return this.http.get(`/instock/cargo-flow/${id} `)
      .then(res => {
        fixDate(res.content, "instockDate");
        return res.content;
      });
  }

  audit(id: string, verifyStatus: number): Promise<void> {
    return this.http.put(`/instock/cargo-flow/audit/${id}/?verifyStatus=${verifyStatus}`, '').then(handleResult);
  }

  updateCargoFlow(cargoFlow: CargoFlow): Promise<void> {
    return this.http.put(`/instock/cargo-flow/${cargoFlow.id}`, cargoFlow).then(handleResult);
  }
}