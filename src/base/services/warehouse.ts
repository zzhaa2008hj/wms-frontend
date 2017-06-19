import { autoinject } from "aurelia-dependency-injection";
import { extractResult, RestClient } from "../../utils";
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
    let url = `/base/warehouse`;
    let res = await this.http.createRequest(url).withContent(warehouse).asPost().send();
    return extractResult(res.content);
  }

  async updateState(id: string): Promise<void> {
    let url = `/base/warehouse/${id}`;
    let res = await this.http.createRequest(url).asPut().send();
    return extractResult(res.content);
  }

  async updateWarehouse(warehouse: any): Promise<void> {
    let url = `/base/warehouse`;
    let res = await this.http.createRequest(url).withContent(warehouse).asPut().send();
    return extractResult(res.content);
  }

  async deleteWarehouse(id: string) {
    let url = `/base/warehouse/${id}`;
    let res = await this.http.createRequest(url).asDelete().send();
    return extractResult(res.content);
  }
}