import { autoinject } from "aurelia-dependency-injection";
import { extractResult, handleResult, RestClient } from "../../utils";
import { Warehouse } from "../models/warehouse";
/**
 * Created by Hui on 2017/6/15.
 */
@autoinject
export class WarehouseService {
  constructor(private http: RestClient) {
  }

  async listWarehouse(params?: { status: boolean }): Promise<Warehouse[]> {
    let url = `/base/warehouse/list`;
    let res = await this.http.createRequest(url).withParams(params).asGet().send();
    return res.content;
  }

  async saveWarehouse(warehouse: Warehouse): Promise<void> {
    return await this.http.post(`/base/warehouse`, warehouse).then(handleResult);
  }

  async updateState(id: string): Promise<void> {
    return await this.http.put(`/base/warehouse/${id}`, null).then(handleResult);
  }

  async updateWarehouse(warehouse: Warehouse): Promise<void> {
    return await this.http.put(`/base/warehouse/${warehouse.id}`, warehouse).then(handleResult);
  }

  async deleteWarehouse(id: string) {
    return await this.http.delete(`/base/warehouse/${id}`).then(handleResult);
  }
}