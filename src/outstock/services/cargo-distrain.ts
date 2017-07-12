import { autoinject } from "aurelia-dependency-injection";
import { handleResult, Query, RestClient } from "@app/utils";
import { CargoDistrain, CargoDistrainVo } from "@app/outstock/models/cargo-distrain";

@autoinject
export class CargoDistrainService {
  constructor(private http: RestClient) {
  }
  /**
   * 分页查询
   */
  queryCargoDistrains(batchNumber: string): Query<CargoDistrainVo> {
    return this.http.query<CargoDistrainVo>(`/outstock/cargo-distrain/page`, { batchNumber });
  }

  /**
   * 保存多个对象
   */
  async saveCargoDistrains(cargoDistrain: CargoDistrain[] | CargoDistrainVo[]): Promise<void> {
    await this.http.post(`/outstock/cargo-distrain`, cargoDistrain).then(handleResult);
  }

  /**
   * 修改
   */
  updateCargoDistrain(id: string, cargoDistrain: CargoDistrain | CargoDistrainVo): Promise<void> {
    return this.http.put(`/outstock/cargo-distrain/${id}`, cargoDistrain).then(handleResult);
  }

  /**
   * 获取单个
   * @param id 
   */
  async getCargoDistrainById(id: string): Promise<CargoDistrain> {
    let res = await this.http.get(`/outstock/cargo-distrain/${id}`);
    return res.content;
  }

  /**
   * 修改状态
   * @param id 
   * @param status 
   */
  updateCargoDistrainStatus(id: string, status: number): Promise<void> {
    return this.http.put(`/outstock/cargo-distrain/${id}/status/${status}`, {}).then(handleResult);
  }
}