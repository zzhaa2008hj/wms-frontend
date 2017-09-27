import { autoinject } from "aurelia-dependency-injection";
import { handleResult, Query, RestClient, fixDate } from "@app/utils";
import { CargoFlow } from "@app/instock/models/cargo-flow";
import { CargoItem } from "@app/base/models/cargo-info";
import { ChangeHistory } from '@app/common/models/change-history';
/**
 * Created by Hui on 2017/6/23.
 */
@autoinject
export class CargoFlowService {
  constructor(private http: RestClient) {
  }

  queryCargoFlows(param: { infoId?: string, keywords: string }): Query<CargoFlow> {
    return this.http.query<CargoFlow>(`/instock/cargo-flow/page`, param).map(flow => fixDate(flow, 'instockDate'));
  }

  async saveCargoFlow(cargoFlow: CargoFlow) {
    await this.http.post(`/instock/cargo-flow`, cargoFlow).then(handleResult);
  }

  /**
   * 入库流水补录
   * @param cargoFlow 
   */
  async cargoFlowAdditionRecording(cargoFlow: CargoFlow) {
    await this.http.post(`/instock/cargo-flow/additionRecording`, cargoFlow).then(handleResult);
  }

  async listBaseCargoItems(cargoInfoId: string): Promise<CargoItem[]> {
    let res = await this.http.get(`/instock/cargo-flow/${cargoInfoId}/baseCargoItemList`);
    return res.content;
  }

  async getCargoFlowById(id: string): Promise<CargoFlow> {
    return this.http.get(`/instock/cargo-flow/${id} `).then(res => fixDate(res.content, "instockDate"));
  }

  audit(id: string, verifyStatus: number): Promise<void> {
    return this.http.put(`/instock/cargo-flow/audit/${id}/?verifyStatus=${verifyStatus}`, '').then(handleResult);
  }

  updateCargoFlow(cargoFlow: CargoFlow): Promise<void> {
    return this.http.put(`/instock/cargo-flow/${cargoFlow.id}`, cargoFlow).then(handleResult);
  }

  async getCargoFlowByFlowNumber(flowNumber: string) {
    return this.http.get(`/instock/cargo-flow/${flowNumber}/flowNumber `)
      .then(res => fixDate(res.content, "instockDate"));
  }

  /**
   *
   *
   * @param {string} id
   * @param {string} historyId
   * @returns {Promise<ChangeHistory<ContractVo>>}
   * @memberof CargoFlowService
   */
  async getChangeHistory(id: string, historyId: string): Promise<ChangeHistory<CargoFlow>> {
    let res = await this.http.get(`/instock/cargo-flow/${id}/changeHistory/${historyId}`);
    return res.content;
  }

  updateFlowStage(id: string, stage: number): Promise<void> {
    return this.http.put(`/instock/cargo-flow/${id}/changStage/${stage}`, '').then(handleResult);
  }

  async getListByCargoInfoId(infoId: string): Promise<CargoFlow[]> {
    let res = await this.http.get(`/instock/cargo-flow/${infoId}/cargoInfoId`);
    return res.content;
  }

  async deleteCargoFlow(id): Promise<void> {
    return this.http.delete(`/instock/cargo-flow/${id}`).then(handleResult);
  }
}