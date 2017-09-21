import { autoinject } from "aurelia-dependency-injection";
import { handleResult, RestClient, Query } from "@app/utils";
import { Warehouse } from "@app/base/models/warehouse";
import { StorageInfoItem } from '@app/base/models/storage';
@autoinject
export class ElectronicWarehouseService {
  constructor(private http: RestClient) {
  }


  listWarehouseTree(): Promise<any[]> {
    return this.http.get(`/rest/electronic-warehouse/listWarehouseTree`).then(res => res.content);
  }

  warehouseCargoInfoCollect(warehouseId: string): Query<StorageInfoItem[]> {
    return this.http.query(`/rest/electronic-warehouse/warehouseCargoInfoCollect?warehouseId=${warehouseId}`);
  }

  warehouseCargoInfo(warehouseId: string): Promise<StorageInfoItem[]> {
    return this.http.get(`/rest/electronic-warehouse/warehouseCargoInfo?warehouseId=${warehouseId}`).then(res => res.content);
  }

  savePosition(data: any[]): Promise<void> {
    return this.http.put(`/rest/electronic-warehouse/savePosition`, data).then(handleResult);
  }

  clearing(storageItemId): Promise<void> {
    return this.http.put(`/rest/electronic-warehouse/${storageItemId}/clearing`, null).then(handleResult);
  }

}