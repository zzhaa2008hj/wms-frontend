import { autoinject } from "aurelia-dependency-injection";
import { handleResult, RestClient } from "@app/utils";
import { Warehouse } from "@app/base/models/warehouse";
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

  listWarehouseByStorageInfo(storageInfoId: string): Promise<Warehouse[]> {
    return this.http.get(`/base/warehouse/list/storage/${storageInfoId}`).then(res => res.content);
  }

  getWarehouses(id: string, type: number): Promise<Warehouse[]> {
    return this.http.get(`/base/warehouse/${id}/list?type=${type}`).then(res => res.content);
  }

  saveWarehouse(warehouse: Warehouse): Promise<void> {
    return this.http.post(`/base/warehouse`, warehouse).then(handleResult);
  }

  updateState(id: string): Promise<void> {
    return this.http.put(`/base/warehouse/${id}/state`, null).then(handleResult);
  }

  updateWarehouse(warehouse: Warehouse): Promise<void> {
    return this.http.put(`/base/warehouse/${warehouse.id}`, warehouse).then(handleResult);
  }

  deleteWarehouse(id: string): Promise<void> {
    return this.http.delete(`/base/warehouse/${id}`).then(handleResult);
  }

  getWarehouseById(id: string): Promise<Warehouse> {
    return this.http.get(`/base/warehouse/${id}`).then(res => res.content);
  }
}