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

  saveWarehouse(warehouse: Warehouse) {
    this.http.post(`/base/warehouse`, warehouse).then(handleResult);
  }

  updateState(id: string) {
    this.http.put(`/base/warehouse/${id}/state`, null).then(handleResult);
  }

  updateWarehouse(warehouse: Warehouse) {
    this.http.put(`/base/warehouse/${warehouse.id}`, warehouse).then(handleResult);
  }

  deleteWarehouse(id: string) {
    this.http.delete(`/base/warehouse/${id}`).then(handleResult);
  }
}